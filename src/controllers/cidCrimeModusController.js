const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { CIDCrimeModus, CIDCrimeCategory, CIDCrimeCategoryType } = require('../models');
const { ValidationException, NotFoundException, ConflictException } = require('../exceptions');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /cid/crime-modus:
 *   get:
 *     tags: [CID]
 *     summary: Get all CID crime modus/methods
 *     description: Retrieve a list of all CID crime modus/methods with optional filtering
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
 *       - name: subCategoryId
 *         in: query
 *         description: Filter by crime sub-category ID
 *         schema:
 *           type: integer
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: CID crime modus retrieved successfully
 */
router.get('/', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, categoryId, subCategoryId, active } = req.query;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { name: { [Op.iLike]: `%${search}%` } },
      { descriptionDetails: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (categoryId) {
    where.cidCrimeCategoryId = categoryId;
  }
  if (subCategoryId) {
    where.cidCrimeSubCategoryId = subCategoryId;
  }
  if (active !== undefined) {
    where.active = active === 'true';
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await CIDCrimeModus.findAndCountAll({
    where,
    include: [
      {
        model: CIDCrimeCategory,
        as: 'category',
        attributes: ['id', 'categoryName', 'categoryCode']
      },
      {
        model: CIDCrimeCategoryType,
        as: 'subCategory',
        attributes: ['id', 'typeOfCrime']
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
    { crimeModus: rows, pagination },
    'CID crime modus retrieved successfully'
  ));
}));

/**
 * @swagger
 * /cid/crime-modus:
 *   post:
 *     tags: [CID]
 *     summary: Create new CID crime modus
 *     description: Create a new CID crime modus/method (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, cidCrimeCategoryId]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pickpocketing"
 *               cidCrimeCategoryId:
 *                 type: integer
 *                 example: 1
 *               cidCrimeSubCategoryId:
 *                 type: integer
 *                 example: 1
 *               descriptionDetails:
 *                 type: string
 *                 example: "Stealing from person's pocket without detection"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: CID crime modus created successfully
 */
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { 
    name, 
    cidCrimeCategoryId, 
    cidCrimeSubCategoryId, 
    descriptionDetails, 
    active = true 
  } = req.body;

  if (!name || !cidCrimeCategoryId) {
    throw new ValidationException('Missing required fields', [
      { field: 'name', message: 'Crime modus name is required' },
      { field: 'cidCrimeCategoryId', message: 'Crime category ID is required' }
    ]);
  }

  // Check if crime category exists
  const category = await CIDCrimeCategory.findByPk(cidCrimeCategoryId);
  if (!category) {
    throw new NotFoundException('CID Crime Category', cidCrimeCategoryId);
  }

  // Check if sub-category exists (if provided)
  if (cidCrimeSubCategoryId) {
    const subCategory = await CIDCrimeCategoryType.findByPk(cidCrimeSubCategoryId);
    if (!subCategory) {
      throw new NotFoundException('CID Crime Category Type', cidCrimeSubCategoryId);
    }
  }

  // Check for duplicate name within the same category and sub-category
  const existingModus = await CIDCrimeModus.findOne({
    where: {
      name: { [Op.iLike]: name },
      cidCrimeCategoryId,
      ...(cidCrimeSubCategoryId && { cidCrimeSubCategoryId })
    }
  });

  if (existingModus) {
    throw new ConflictException('Crime modus with this name already exists in this category');
  }

  const crimeModus = await CIDCrimeModus.create({
    name: name.trim(),
    cidCrimeCategoryId,
    cidCrimeSubCategoryId,
    descriptionDetails: descriptionDetails?.trim(),
    active,
    createdBy: req.user.id
  });

  res.status(201).json(ResponseFormatter.success(crimeModus, 'CID crime modus created successfully'));
}));

/**
 * @swagger
 * /cid/crime-modus/{id}:
 *   get:
 *     tags: [CID]
 *     summary: Get CID crime modus by ID
 *     description: Retrieve a specific CID crime modus by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Modus ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime modus retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const crimeModus = await CIDCrimeModus.findByPk(id, {
    include: [
      {
        model: CIDCrimeCategory,
        as: 'category',
        attributes: ['id', 'categoryName', 'categoryCode']
      },
      {
        model: CIDCrimeCategoryType,
        as: 'subCategory',
        attributes: ['id', 'typeOfCrime']
      }
    ]
  });

  if (!crimeModus) {
    throw new NotFoundException('CID Crime Modus', id);
  }

  res.json(ResponseFormatter.success(crimeModus, 'CID crime modus retrieved successfully'));
}));

/**
 * @swagger
 * /cid/crime-modus/{id}:
 *   put:
 *     tags: [CID]
 *     summary: Update CID crime modus
 *     description: Update an existing CID crime modus (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Modus ID
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
 *               cidCrimeCategoryId:
 *                 type: integer
 *               cidCrimeSubCategoryId:
 *                 type: integer
 *               descriptionDetails:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CID crime modus updated successfully
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { 
    name, 
    cidCrimeCategoryId, 
    cidCrimeSubCategoryId, 
    descriptionDetails, 
    active 
  } = req.body;

  const crimeModus = await CIDCrimeModus.findByPk(id);
  if (!crimeModus) {
    throw new NotFoundException('CID Crime Modus', id);
  }

  // Check if crime category exists (if being updated)
  if (cidCrimeCategoryId && cidCrimeCategoryId !== crimeModus.cidCrimeCategoryId) {
    const category = await CIDCrimeCategory.findByPk(cidCrimeCategoryId);
    if (!category) {
      throw new NotFoundException('CID Crime Category', cidCrimeCategoryId);
    }
  }

  // Check if sub-category exists (if being updated)
  if (cidCrimeSubCategoryId && cidCrimeSubCategoryId !== crimeModus.cidCrimeSubCategoryId) {
    const subCategory = await CIDCrimeCategoryType.findByPk(cidCrimeSubCategoryId);
    if (!subCategory) {
      throw new NotFoundException('CID Crime Category Type', cidCrimeSubCategoryId);
    }
  }

  // Check for duplicate name within the same category and sub-category (excluding current modus)
  if (name) {
    const categoryIdToCheck = cidCrimeCategoryId || crimeModus.cidCrimeCategoryId;
    const subCategoryIdToCheck = cidCrimeSubCategoryId !== undefined ? cidCrimeSubCategoryId : crimeModus.cidCrimeSubCategoryId;
    
    const existingModus = await CIDCrimeModus.findOne({
      where: {
        name: { [Op.iLike]: name },
        cidCrimeCategoryId: categoryIdToCheck,
        ...(subCategoryIdToCheck && { cidCrimeSubCategoryId: subCategoryIdToCheck }),
        id: { [Op.ne]: id }
      }
    });

    if (existingModus) {
      throw new ConflictException('Crime modus with this name already exists in this category');
    }
  }

  const updateData = {};
  if (name) updateData.name = name.trim();
  if (cidCrimeCategoryId) updateData.cidCrimeCategoryId = cidCrimeCategoryId;
  if (cidCrimeSubCategoryId !== undefined) updateData.cidCrimeSubCategoryId = cidCrimeSubCategoryId;
  if (descriptionDetails !== undefined) updateData.descriptionDetails = descriptionDetails?.trim();
  if (active !== undefined) updateData.active = active;
  updateData.updatedBy = req.user.id;

  await crimeModus.update(updateData);

  res.json(ResponseFormatter.success(crimeModus, 'CID crime modus updated successfully'));
}));

/**
 * @swagger
 * /cid/crime-modus/{id}/activate:
 *   put:
 *     tags: [CID]
 *     summary: Activate CID crime modus
 *     description: Activate a CID crime modus (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Modus ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime modus activated successfully
 */
router.put('/:id/activate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const crimeModus = await CIDCrimeModus.findByPk(id);
  if (!crimeModus) {
    throw new NotFoundException('CID Crime Modus', id);
  }

  await crimeModus.update({
    active: true,
    updatedBy: req.user.id
  });

  res.json(ResponseFormatter.success(crimeModus, 'CID crime modus activated successfully'));
}));

/**
 * @swagger
 * /cid/crime-modus/{id}/deactivate:
 *   put:
 *     tags: [CID]
 *     summary: Deactivate CID crime modus
 *     description: Deactivate a CID crime modus (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Modus ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime modus deactivated successfully
 */
router.put('/:id/deactivate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const crimeModus = await CIDCrimeModus.findByPk(id);
  if (!crimeModus) {
    throw new NotFoundException('CID Crime Modus', id);
  }

  await crimeModus.update({
    active: false,
    updatedBy: req.user.id
  });

  res.json(ResponseFormatter.success(crimeModus, 'CID crime modus deactivated successfully'));
}));

/**
 * @swagger
 * /cid/crime-modus/{id}:
 *   delete:
 *     tags: [CID]
 *     summary: Delete CID crime modus
 *     description: Delete a CID crime modus (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Modus ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime modus deleted successfully
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const crimeModus = await CIDCrimeModus.findByPk(id);
  if (!crimeModus) {
    throw new NotFoundException('CID Crime Modus', id);
  }

  await crimeModus.destroy();

  res.json(ResponseFormatter.success(null, 'CID crime modus deleted successfully'));
}));

module.exports = router;