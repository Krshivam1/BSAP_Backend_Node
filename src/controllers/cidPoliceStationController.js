const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { CIDPoliceStation, CIDDistrict, CIDSubDivision } = require('../models');
const { ValidationException, NotFoundException, ConflictException } = require('../exceptions');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /cid/police-stations:
 *   get:
 *     tags: [CID]
 *     summary: Get all CID police stations
 *     description: Retrieve a list of all CID police stations with optional filtering
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
 *       - name: subDivisionId
 *         in: query
 *         description: Filter by sub-division ID
 *         schema:
 *           type: integer
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: CID police stations retrieved successfully
 */
router.get('/', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, districtId, subDivisionId, active } = req.query;
  
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
  if (subDivisionId) {
    where.cidSubDivisionId = subDivisionId;
  }
  if (active !== undefined) {
    where.isActive = active === 'true';
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await CIDPoliceStation.findAndCountAll({
    where,
    include: [
      {
        model: CIDDistrict,
        as: 'district',
        attributes: ['id', 'name', 'code']
      },
      {
        model: CIDSubDivision,
        as: 'subDivision',
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
    { policeStations: rows, pagination },
    'CID police stations retrieved successfully'
  ));
}));

/**
 * @swagger
 * /cid/police-stations:
 *   post:
 *     tags: [CID]
 *     summary: Create new CID police station
 *     description: Create a new CID police station (Admin access required)
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
 *                 example: "CID Police Station Central"
 *               code:
 *                 type: string
 *                 example: "CIDPSC"
 *               cidDistrictId:
 *                 type: integer
 *                 example: 1
 *               cidSubDivisionId:
 *                 type: integer
 *                 example: 1
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: CID police station created successfully
 */
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { name, code, cidDistrictId, cidSubDivisionId, isActive = true } = req.body;

  if (!name || !code || !cidDistrictId) {
    throw new ValidationException('Missing required fields', [
      { field: 'name', message: 'Police station name is required' },
      { field: 'code', message: 'Police station code is required' },
      { field: 'cidDistrictId', message: 'CID District ID is required' }
    ]);
  }

  // Check if district exists
  const district = await CIDDistrict.findByPk(cidDistrictId);
  if (!district) {
    throw new NotFoundException('CID District', cidDistrictId);
  }

  // Check if sub-division exists (if provided)
  if (cidSubDivisionId) {
    const subDivision = await CIDSubDivision.findByPk(cidSubDivisionId);
    if (!subDivision) {
      throw new NotFoundException('CID Sub-Division', cidSubDivisionId);
    }
  }

  // Check for duplicate name or code
  const existingStation = await CIDPoliceStation.findOne({
    where: {
      [Op.or]: [
        { name: { [Op.iLike]: name } },
        { code: { [Op.iLike]: code } }
      ]
    }
  });

  if (existingStation) {
    throw new ConflictException('CID police station with this name or code already exists');
  }

  const policeStation = await CIDPoliceStation.create({
    name: name.trim(),
    code: code.trim().toUpperCase(),
    cidDistrictId,
    cidSubDivisionId,
    isActive,
    createdBy: req.user.id
  });

  res.status(201).json(ResponseFormatter.success(policeStation, 'CID police station created successfully'));
}));

/**
 * @swagger
 * /cid/police-stations/{id}:
 *   get:
 *     tags: [CID]
 *     summary: Get CID police station by ID
 *     description: Retrieve a specific CID police station by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Police Station ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID police station retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const policeStation = await CIDPoliceStation.findByPk(id, {
    include: [
      {
        model: CIDDistrict,
        as: 'district',
        attributes: ['id', 'name', 'code']
      },
      {
        model: CIDSubDivision,
        as: 'subDivision',
        attributes: ['id', 'name', 'code']
      }
    ]
  });

  if (!policeStation) {
    throw new NotFoundException('CID Police Station', id);
  }

  res.json(ResponseFormatter.success(policeStation, 'CID police station retrieved successfully'));
}));

/**
 * @swagger
 * /cid/police-stations/{id}:
 *   put:
 *     tags: [CID]
 *     summary: Update CID police station
 *     description: Update an existing CID police station (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Police Station ID
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
 *               cidSubDivisionId:
 *                 type: integer
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CID police station updated successfully
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, code, cidDistrictId, cidSubDivisionId, isActive } = req.body;

  const policeStation = await CIDPoliceStation.findByPk(id);
  if (!policeStation) {
    throw new NotFoundException('CID Police Station', id);
  }

  // Check if district exists (if being updated)
  if (cidDistrictId && cidDistrictId !== policeStation.cidDistrictId) {
    const district = await CIDDistrict.findByPk(cidDistrictId);
    if (!district) {
      throw new NotFoundException('CID District', cidDistrictId);
    }
  }

  // Check if sub-division exists (if being updated)
  if (cidSubDivisionId && cidSubDivisionId !== policeStation.cidSubDivisionId) {
    const subDivision = await CIDSubDivision.findByPk(cidSubDivisionId);
    if (!subDivision) {
      throw new NotFoundException('CID Sub-Division', cidSubDivisionId);
    }
  }

  // Check for duplicate name or code (excluding current station)
  if (name || code) {
    const duplicateCheck = {};
    if (name) duplicateCheck.name = { [Op.iLike]: name };
    if (code) duplicateCheck.code = { [Op.iLike]: code };

    const existingStation = await CIDPoliceStation.findOne({
      where: {
        ...duplicateCheck,
        id: { [Op.ne]: id }
      }
    });

    if (existingStation) {
      throw new ConflictException('CID police station with this name or code already exists');
    }
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (code) updateData.code = code.trim().toUpperCase();
  if (cidDistrictId) updateData.cidDistrictId = cidDistrictId;
  if (cidSubDivisionId !== undefined) updateData.cidSubDivisionId = cidSubDivisionId;
  if (isActive !== undefined) updateData.isActive = isActive;
  updateData.updatedBy = req.user.id;

  await policeStation.update(updateData);

  res.json(ResponseFormatter.success(policeStation, 'CID police station updated successfully'));
}));

/**
 * @swagger
 * /cid/police-stations/{id}:
 *   delete:
 *     tags: [CID]
 *     summary: Delete CID police station
 *     description: Delete a CID police station (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Police Station ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID police station deleted successfully
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const policeStation = await CIDPoliceStation.findByPk(id);
  if (!policeStation) {
    throw new NotFoundException('CID Police Station', id);
  }

  await policeStation.destroy();

  res.json(ResponseFormatter.success(null, 'CID police station deleted successfully'));
}));

module.exports = router;