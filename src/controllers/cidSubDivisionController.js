const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { CIDSubDivision, CIDDistrict } = require('../models');
const { ValidationException, NotFoundException, ConflictException } = require('../exceptions');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /cid/sub-divisions:
 *   get:
 *     tags: [CID]
 *     summary: Get all CID sub-divisions
 *     description: Retrieve a list of all CID sub-divisions with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         schema:
 *           type: integer
 *           default: 10
 *       - name: search
 *         in: query
 *         description: Search term
 *         schema:
 *           type: string
 *       - name: districtId
 *         in: query
 *         description: Filter by district ID
 *         schema:
 *           type: integer
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: CID sub-divisions retrieved successfully
 */
router.get('/', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, districtId, active } = req.query;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (districtId) {
    where.cidDistrictId = districtId;
  }
  if (active !== undefined) {
    where.isActive = active === 'true';
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await CIDSubDivision.findAndCountAll({
    where,
    include: [
      {
        model: CIDDistrict,
        as: 'district',
        attributes: ['id', 'name', 'code']
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['name', 'ASC']]
  });

  const pagination = {
    page: parseInt(page),
    limit: parseInt(limit),
    total: count,
    totalPages: Math.ceil(count / limit),
    hasNext: offset + parseInt(limit) < count,
    hasPrev: page > 1
  };

  res.json(ResponseFormatter.success(
    { subDivisions: rows, pagination },
    'CID sub-divisions retrieved successfully'
  ));
}));

/**
 * @swagger
 * /cid/sub-divisions:
 *   post:
 *     tags: [CID]
 *     summary: Create new CID sub-division
 *     description: Create a new CID sub-division (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, cidDistrictId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "CID Sub-Division North"
 *               code:
 *                 type: string
 *                 example: "CIDSDN"
 *               cidDistrictId:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: CID sub-division created successfully
 */
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { name, code, cidDistrictId, isActive = true } = req.body;

  if (!name || !code || !cidDistrictId) {
    throw new ValidationException('Missing required fields', [
      { field: 'name', message: 'Sub-division name is required' },
      { field: 'code', message: 'Sub-division code is required' },
      { field: 'cidDistrictId', message: 'CID District ID is required' }
    ]);
  }

  // Check if district exists
  const district = await CIDDistrict.findByPk(cidDistrictId);
  if (!district) {
    throw new NotFoundException('CID District', cidDistrictId);
  }

  // Check for duplicate name or code
  const existingSubDivision = await CIDSubDivision.findOne({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: name } },
        { code: { [Op.iLike]: code } }
      ]
    }
  });

  if (existingSubDivision) {
    throw new ConflictException('CID sub-division with this name or code already exists');
  }

  const subDivision = await CIDSubDivision.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    cidDistrictId,
    isActive,
    createdBy: req.user.id
  });

  res.status(201).json(ResponseFormatter.success(subDivision, 'CID sub-division created successfully'));
}));

/**
 * @swagger
 * /cid/sub-divisions/{id}:
 *   get:
 *     tags: [CID]
 *     summary: Get CID sub-division by ID
 *     description: Retrieve a specific CID sub-division by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Sub-Division ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID sub-division retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const subDivision = await CIDSubDivision.findByPk(id, {
    include: [
      {
        model: CIDDistrict,
        as: 'district',
        attributes: ['id', 'name', 'code']
      }
    ]
  });

  if (!subDivision) {
    throw new NotFoundException('CID Sub-Division', id);
  }

  res.json(ResponseFormatter.success(subDivision, 'CID sub-division retrieved successfully'));
}));

/**
 * @swagger
 * /cid/sub-divisions/{id}:
 *   put:
 *     tags: [CID]
 *     summary: Update CID sub-division
 *     description: Update an existing CID sub-division (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Sub-Division ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               cidDistrictId:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CID sub-division updated successfully
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, cidDistrictId, isActive } = req.body;

  const subDivision = await CIDSubDivision.findByPk(id);
  if (!subDivision) {
    throw new NotFoundException('CID Sub-Division', id);
  }

  // Check if district exists (if being updated)
  if (cidDistrictId && cidDistrictId !== subDivision.cidDistrictId) {
    const district = await CIDDistrict.findByPk(cidDistrictId);
    if (!district) {
      throw new NotFoundException('CID District', cidDistrictId);
    }
  }

  // Check for duplicate name or code (excluding current sub-division)
  if (name || code) {
    const duplicateCheck = {};
    if (name) duplicateCheck.name = { [Op.iLike]: name };
    if (code) duplicateCheck.code = { [Op.iLike]: code };

    const existingSubDivision = await CIDSubDivision.findOne({
      where: {
        ...duplicateCheck,
        id: { [Op.ne]: id }
      }
    });

    if (existingSubDivision) {
      throw new ConflictException('CID sub-division with this name or code already exists');
    }
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (code) updateData.code = code.trim().toUpperCase();
  if (cidDistrictId) updateData.cidDistrictId = cidDistrictId;
  if (isActive !== undefined) updateData.isActive = isActive;
  updateData.updatedBy = req.user.id;

  await subDivision.update(updateData);

  res.json(ResponseFormatter.success(subDivision, 'CID sub-division updated successfully'));
}));

/**
 * @swagger
 * /cid/sub-divisions/{id}:
 *   delete:
 *     tags: [CID]
 *     summary: Delete CID sub-division
 *     description: Delete a CID sub-division (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Sub-Division ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID sub-division deleted successfully
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subDivision = await CIDSubDivision.findByPk(id);
  if (!subDivision) {
    throw new NotFoundException('CID Sub-Division', id);
  }

  await subDivision.destroy();

  res.json(ResponseFormatter.success(null, 'CID sub-division deleted successfully'));
}));

module.exports = router;