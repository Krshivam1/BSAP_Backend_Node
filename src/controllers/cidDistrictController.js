const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { CIDDistrict, State } = require('../models');
const { ValidationException, NotFoundException, ConflictException } = require('../exceptions');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /cid/districts:
 *   get:
 *     tags: [CID]
 *     summary: Get all CID districts
 *     description: Retrieve a list of all CID districts with optional filtering
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
 *       - name: stateId
 *         in: query
 *         description: Filter by state ID
 *         schema:
 *           type: integer
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: CID districts retrieved successfully
 */
router.get('/', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, stateId, active } = req.query;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { code: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (stateId) {
    where.stateId = stateId;
  }
  if (active !== undefined) {
    where.isActive = active === 'true';
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await CIDDistrict.findAndCountAll({
    where,
    include: [
      {
        model: State,
        as: 'state',
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
    { districts: rows, pagination },
    'CID districts retrieved successfully'
  ));
}));

/**
 * @swagger
 * /cid/districts:
 *   post:
 *     tags: [CID]
 *     summary: Create new CID district
 *     description: Create a new CID district (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, code, stateId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "CID Bangalore"
 *               code:
 *                 type: string
 *                 example: "CIDBLR"
 *               stateId:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: CID district created successfully
 */
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { name, code, stateId, isActive = true } = req.body;

  if (!name || !code || !stateId) {
    throw new ValidationException('Missing required fields', [
      { field: 'name', message: 'District name is required' },
      { field: 'code', message: 'District code is required' },
      { field: 'stateId', message: 'State ID is required' }
    ]);
  }

  // Check if state exists
  const state = await State.findByPk(stateId);
  if (!state) {
    throw new NotFoundException('State', stateId);
  }

  // Check for duplicate name or code
  const existingDistrict = await CIDDistrict.findOne({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: name } },
        { code: { [Op.iLike]: code } }
      ]
    }
  });

  if (existingDistrict) {
    throw new ConflictException('CID district with this name or code already exists');
  }

  const district = await CIDDistrict.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    stateId,
    isActive,
    createdBy: req.user.id
  });

  res.status(201).json(ResponseFormatter.success(district, 'CID district created successfully'));
}));

/**
 * @swagger
 * /cid/districts/{id}:
 *   get:
 *     tags: [CID]
 *     summary: Get CID district by ID
 *     description: Retrieve a specific CID district by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID District ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID district retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const district = await CIDDistrict.findByPk(id, {
    include: [
      {
        model: State,
        as: 'state',
        attributes: ['id', 'name', 'code']
      }
    ]
  });

  if (!district) {
    throw new NotFoundException('CID District', id);
  }

  res.json(ResponseFormatter.success(district, 'CID district retrieved successfully'));
}));

/**
 * @swagger
 * /cid/districts/{id}:
 *   put:
 *     tags: [CID]
 *     summary: Update CID district
 *     description: Update an existing CID district (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID District ID
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
 *               stateId:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CID district updated successfully
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, stateId, isActive } = req.body;

  const district = await CIDDistrict.findByPk(id);
  if (!district) {
    throw new NotFoundException('CID District', id);
  }

  // Check if state exists (if stateId is being updated)
  if (stateId && stateId !== district.stateId) {
    const state = await State.findByPk(stateId);
    if (!state) {
      throw new NotFoundException('State', stateId);
    }
  }

  // Check for duplicate name or code (excluding current district)
  if (name || code) {
    const duplicateCheck = {};
    if (name) duplicateCheck.name = { [Op.iLike]: name };
    if (code) duplicateCheck.code = { [Op.iLike]: code };

    const existingDistrict = await CIDDistrict.findOne({
      where: {
        ...duplicateCheck,
        id: { [Op.ne]: id }
      }
    });

    if (existingDistrict) {
      throw new ConflictException('CID district with this name or code already exists');
    }
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (code) updateData.code = code.trim().toUpperCase();
  if (stateId) updateData.stateId = stateId;
  if (isActive !== undefined) updateData.isActive = isActive;
  updateData.updatedBy = req.user.id;

  await district.update(updateData);

  res.json(ResponseFormatter.success(district, 'CID district updated successfully'));
}));

/**
 * @swagger
 * /cid/districts/{id}:
 *   delete:
 *     tags: [CID]
 *     summary: Delete CID district
 *     description: Delete a CID district (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID District ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID district deleted successfully
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const district = await CIDDistrict.findByPk(id);
  if (!district) {
    throw new NotFoundException('CID District', id);
  }

  await district.destroy();

  res.json(ResponseFormatter.success(null, 'CID district deleted successfully'));
}));

/**
 * @swagger
 * /cid/districts/{id}/activate:
 *   post:
 *     tags: [CID]
 *     summary: Activate CID district
 *     description: Activate a deactivated CID district
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID District ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID district activated successfully
 */
router.post('/:id/activate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const district = await CIDDistrict.findByPk(id);
  if (!district) {
    throw new NotFoundException('CID District', id);
  }

  await district.update({ 
    isActive: true,
    updatedBy: req.user.id 
  });

  res.json(ResponseFormatter.success(district, 'CID district activated successfully'));
}));

/**
 * @swagger
 * /cid/districts/{id}/deactivate:
 *   post:
 *     tags: [CID]
 *     summary: Deactivate CID district
 *     description: Deactivate an active CID district
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID District ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID district deactivated successfully
 */
router.post('/:id/deactivate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const district = await CIDDistrict.findByPk(id);
  if (!district) {
    throw new NotFoundException('CID District', id);
  }

  await district.update({ 
    isActive: false,
    updatedBy: req.user.id 
  });

  res.json(ResponseFormatter.success(district, 'CID district deactivated successfully'));
}));

module.exports = router;