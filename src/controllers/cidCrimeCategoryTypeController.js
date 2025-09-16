const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { CIDCrimeCategoryType, CIDCrimeCategory } = require('../models');
const { ValidationException, NotFoundException, ConflictException } = require('../exceptions');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /cid/crime-category-types:
 *   get:
 *     tags: [CID]
 *     summary: Get all CID crime category types
 *     description: Retrieve a list of all CID crime category types with optional filtering
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
 *       - name: categoryId
 *         in: query
 *         description: Filter by crime category ID
 *         schema:
 *           type: integer
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: CID crime category types retrieved successfully
 */
router.get('/', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, categoryId, active } = req.query;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { typeOfCrime: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (categoryId) {
    where.cidCrimeCategoryId = categoryId;
  }
  if (active !== undefined) {
    where.active = active === 'true';
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await CIDCrimeCategoryType.findAndCountAll({
    where,
    include: [
      {
        model: CIDCrimeCategory,
        as: 'category',
        attributes: ['id', 'categoryName', 'categoryCode']
      }
    ],
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['typeOfCrime', 'ASC']]
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
    { categoryTypes: rows, pagination },
    'CID crime category types retrieved successfully'
  ));
}));

/**
 * @swagger
 * /cid/crime-category-types:
 *   post:
 *     tags: [CID]
 *     summary: Create new CID crime category type
 *     description: Create a new CID crime category type (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [typeOfCrime, cidCrimeCategoryId]
 *             properties:
 *               typeOfCrime:
 *                 type: string
 *                 example: "Armed Robbery"
 *               cidCrimeCategoryId:
 *                 type: integer
 *                 example: 1
 *               description:
 *                 type: string
 *                 example: "Theft involving weapons or force"
 *               allowAccused:
 *                 type: boolean
 *                 default: true
 *               allowDeceased:
 *                 type: boolean
 *                 default: false
 *               allowVictim:
 *                 type: boolean
 *                 default: true
 *               allowCashCollection:
 *                 type: boolean
 *                 default: false
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: CID crime category type created successfully
 */
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { 
    typeOfCrime, 
    cidCrimeCategoryId, 
    description, 
    allowAccused = true, 
    allowDeceased = false, 
    allowVictim = true, 
    allowCashCollection = false,
    active = true 
  } = req.body;

  if (!typeOfCrime || !cidCrimeCategoryId) {
    throw new ValidationException('Missing required fields', [
      { field: 'typeOfCrime', message: 'Type of crime is required' },
      { field: 'cidCrimeCategoryId', message: 'Crime category ID is required' }
    ]);
  }

  // Check if crime category exists
  const category = await CIDCrimeCategory.findByPk(cidCrimeCategoryId);
  if (!category) {
    throw new NotFoundException('CID Crime Category', cidCrimeCategoryId);
  }

  // Check for duplicate type of crime within the same category
  const existingType = await CIDCrimeCategoryType.findOne({
    where: {
      typeOfCrime: { [Op.iLike]: typeOfCrime },
      cidCrimeCategoryId
    }
  });

  if (existingType) {
    throw new ConflictException('Crime category type with this name already exists in this category');
  }

  const categoryType = await CIDCrimeCategoryType.create({
    typeOfCrime: typeOfCrime.trim(),
    cidCrimeCategoryId,
    description: description?.trim(),
    allowAccused,
    allowDeceased,
    allowVictim,
    allowCashCollection,
    active,
    createdBy: req.user.id
  });

  res.status(201).json(ResponseFormatter.success(categoryType, 'CID crime category type created successfully'));
}));

/**
 * @swagger
 * /cid/crime-category-types/{id}:
 *   get:
 *     tags: [CID]
 *     summary: Get CID crime category type by ID
 *     description: Retrieve a specific CID crime category type by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category Type ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category type retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const categoryType = await CIDCrimeCategoryType.findByPk(id, {
    include: [
      {
        model: CIDCrimeCategory,
        as: 'category',
        attributes: ['id', 'categoryName', 'categoryCode']
      }
    ]
  });

  if (!categoryType) {
    throw new NotFoundException('CID Crime Category Type', id);
  }

  res.json(ResponseFormatter.success(categoryType, 'CID crime category type retrieved successfully'));
}));

/**
 * @swagger
 * /cid/crime-category-types/{id}:
 *   put:
 *     tags: [CID]
 *     summary: Update CID crime category type
 *     description: Update an existing CID crime category type (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category Type ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               typeOfCrime:
 *                 type: string
 *               cidCrimeCategoryId:
 *                 type: integer
 *               description:
 *                 type: string
 *               allowAccused:
 *                 type: boolean
 *               allowDeceased:
 *                 type: boolean
 *               allowVictim:
 *                 type: boolean
 *               allowCashCollection:
 *                 type: boolean
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CID crime category type updated successfully
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    typeOfCrime, 
    cidCrimeCategoryId, 
    description, 
    allowAccused, 
    allowDeceased, 
    allowVictim, 
    allowCashCollection,
    active 
  } = req.body;

  const categoryType = await CIDCrimeCategoryType.findByPk(id);
  if (!categoryType) {
    throw new NotFoundException('CID Crime Category Type', id);
  }

  // Check if crime category exists (if being updated)
  if (cidCrimeCategoryId && cidCrimeCategoryId !== categoryType.cidCrimeCategoryId) {
    const category = await CIDCrimeCategory.findByPk(cidCrimeCategoryId);
    if (!category) {
      throw new NotFoundException('CID Crime Category', cidCrimeCategoryId);
    }
  }

  // Check for duplicate type of crime within the same category (excluding current type)
  if (typeOfCrime) {
    const categoryIdToCheck = cidCrimeCategoryId || categoryType.cidCrimeCategoryId;
    const existingType = await CIDCrimeCategoryType.findOne({
      where: {
        typeOfCrime: { [Op.iLike]: typeOfCrime },
        cidCrimeCategoryId: categoryIdToCheck,
        id: { [Op.ne]: id }
      }
    });

    if (existingType) {
      throw new ConflictException('Crime category type with this name already exists in this category');
    }
  }

  const updateData = {};
  if (typeOfCrime) updateData.typeOfCrime = typeOfCrime.trim();
  if (cidCrimeCategoryId) updateData.cidCrimeCategoryId = cidCrimeCategoryId;
  if (description !== undefined) updateData.description = description?.trim();
  if (allowAccused !== undefined) updateData.allowAccused = allowAccused;
  if (allowDeceased !== undefined) updateData.allowDeceased = allowDeceased;
  if (allowVictim !== undefined) updateData.allowVictim = allowVictim;
  if (allowCashCollection !== undefined) updateData.allowCashCollection = allowCashCollection;
  if (active !== undefined) updateData.active = active;
  updateData.updatedBy = req.user.id;

  await categoryType.update(updateData);

  res.json(ResponseFormatter.success(categoryType, 'CID crime category type updated successfully'));
}));

/**
 * @swagger
 * /cid/crime-category-types/{id}/activate:
 *   put:
 *     tags: [CID]
 *     summary: Activate CID crime category type
 *     description: Activate a CID crime category type (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category Type ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category type activated successfully
 */
router.put('/:id/activate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const categoryType = await CIDCrimeCategoryType.findByPk(id);
  if (!categoryType) {
    throw new NotFoundException('CID Crime Category Type', id);
  }

  await categoryType.update({
    active: true,
    updatedBy: req.user.id
  });

  res.json(ResponseFormatter.success(categoryType, 'CID crime category type activated successfully'));
}));

/**
 * @swagger
 * /cid/crime-category-types/{id}/deactivate:
 *   put:
 *     tags: [CID]
 *     summary: Deactivate CID crime category type
 *     description: Deactivate a CID crime category type (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category Type ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category type deactivated successfully
 */
router.put('/:id/deactivate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const categoryType = await CIDCrimeCategoryType.findByPk(id);
  if (!categoryType) {
    throw new NotFoundException('CID Crime Category Type', id);
  }

  await categoryType.update({
    active: false,
    updatedBy: req.user.id
  });

  res.json(ResponseFormatter.success(categoryType, 'CID crime category type deactivated successfully'));
}));

/**
 * @swagger
 * /cid/crime-category-types/{id}:
 *   delete:
 *     tags: [CID]
 *     summary: Delete CID crime category type
 *     description: Delete a CID crime category type (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category Type ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category type deleted successfully
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const categoryType = await CIDCrimeCategoryType.findByPk(id);
  if (!categoryType) {
    throw new NotFoundException('CID Crime Category Type', id);
  }

  await categoryType.destroy();

  res.json(ResponseFormatter.success(null, 'CID crime category type deleted successfully'));
}));

module.exports = router;