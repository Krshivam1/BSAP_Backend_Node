const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const { ErrorHandler } = require('../middleware/errorHandler');
const { ResponseFormatter } = require('../dto');
const { CIDCrimeCategory } = require('../models');
const { ValidationException, NotFoundException, ConflictException } = require('../exceptions');
const { Op } = require('sequelize');

const router = express.Router();

/**
 * @swagger
 * /cid/crime-categories:
 *   get:
 *     tags: [CID]
 *     summary: Get all CID crime categories
 *     description: Retrieve a list of all CID crime categories with optional filtering
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
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: CID crime categories retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     categories:
 *                       type: array
 *                       items:
 *                         type: object
 *                     pagination:
 *                       $ref: '#/components/schemas/Pagination'
 */
router.get('/', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search, active } = req.query;
  
  const where = {};
  if (search) {
    where[Op.or] = [
      { categoryName: { [Op.iLike]: `%${search}%` } },
      { categoryCode: { [Op.iLike]: `%${search}%` } },
      { description: { [Op.iLike]: `%${search}%` } }
    ];
  }
  if (active !== undefined) {
    where.active = active === 'true';
  }

  const offset = (page - 1) * limit;
  const { count, rows } = await CIDCrimeCategory.findAndCountAll({
    where,
    limit: parseInt(limit),
    offset: parseInt(offset),
    order: [['categoryName', 'ASC']]
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
    { categories: rows, pagination },
    'CID crime categories retrieved successfully'
  ));
}));

/**
 * @swagger
 * /cid/crime-categories:
 *   post:
 *     tags: [CID]
 *     summary: Create new CID crime category
 *     description: Create a new CID crime category (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [categoryName, categoryCode]
 *             properties:
 *               categoryName:
 *                 type: string
 *                 example: "Theft"
 *               categoryCode:
 *                 type: string
 *                 example: "THEFT"
 *               description:
 *                 type: string
 *                 example: "All types of theft related crimes"
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: CID crime category created successfully
 */
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { categoryName, categoryCode, description, active = true } = req.body;

  if (!categoryName || !categoryCode) {
    throw new ValidationException('Missing required fields', [
      { field: 'categoryName', message: 'Crime category name is required' },
      { field: 'categoryCode', message: 'Crime category code is required' }
    ]);
  }

  // Check for duplicate name or code
  const existingCategory = await CIDCrimeCategory.findOne({
    where: {
      [Op.or]: [
        { categoryName: { [Op.iLike]: categoryName } },
        { categoryCode: { [Op.iLike]: categoryCode } }
      ]
    }
  });

  if (existingCategory) {
    throw new ConflictException('CID crime category with this name or code already exists');
  }

  const category = await CIDCrimeCategory.create({
    categoryName: categoryName.trim(),
    categoryCode: categoryCode.trim().toUpperCase(),
    description: description?.trim(),
    active,
    createdBy: req.user.id
  });

  res.status(201).json(ResponseFormatter.success(category, 'CID crime category created successfully'));
}));

/**
 * @swagger
 * /cid/crime-categories/{id}:
 *   get:
 *     tags: [CID]
 *     summary: Get CID crime category by ID
 *     description: Retrieve a specific CID crime category by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', authenticate, ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const category = await CIDCrimeCategory.findByPk(id);

  if (!category) {
    throw new NotFoundException('CID Crime Category', id);
  }

  res.json(ResponseFormatter.success(category, 'CID crime category retrieved successfully'));
}));

/**
 * @swagger
 * /cid/crime-categories/{id}:
 *   put:
 *     tags: [CID]
 *     summary: Update CID crime category
 *     description: Update an existing CID crime category (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category ID
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categoryName:
 *                 type: string
 *               categoryCode:
 *                 type: string
 *               description:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: CID crime category updated successfully
 */
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { categoryName, categoryCode, description, active } = req.body;

  const category = await CIDCrimeCategory.findByPk(id);
  if (!category) {
    throw new NotFoundException('CID Crime Category', id);
  }

  // Check for duplicate name or code (excluding current category)
  if (categoryName || categoryCode) {
    const duplicateCheck = {};
    if (categoryName) duplicateCheck.categoryName = { [Op.iLike]: categoryName };
    if (categoryCode) duplicateCheck.categoryCode = { [Op.iLike]: categoryCode };

    const existingCategory = await CIDCrimeCategory.findOne({
      where: {
        ...duplicateCheck,
        id: { [Op.ne]: id }
      }
    });

    if (existingCategory) {
      throw new ConflictException('CID crime category with this name or code already exists');
    }
  }

  const updateData = {};
  if (categoryName) updateData.categoryName = categoryName.trim();
  if (categoryCode) updateData.categoryCode = categoryCode.trim().toUpperCase();
  if (description !== undefined) updateData.description = description?.trim();
  if (active !== undefined) updateData.active = active;
  updateData.updatedBy = req.user.id;

  await category.update(updateData);

  res.json(ResponseFormatter.success(category, 'CID crime category updated successfully'));
}));

/**
 * @swagger
 * /cid/crime-categories/{id}/activate:
 *   put:
 *     tags: [CID]
 *     summary: Activate CID crime category
 *     description: Activate a CID crime category (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category activated successfully
 */
router.put('/:id/activate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await CIDCrimeCategory.findByPk(id);
  if (!category) {
    throw new NotFoundException('CID Crime Category', id);
  }

  await category.update({
    active: true,
    updatedBy: req.user.id
  });

  res.json(ResponseFormatter.success(category, 'CID crime category activated successfully'));
}));

/**
 * @swagger
 * /cid/crime-categories/{id}/deactivate:
 *   put:
 *     tags: [CID]
 *     summary: Deactivate CID crime category
 *     description: Deactivate a CID crime category (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category deactivated successfully
 */
router.put('/:id/deactivate', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await CIDCrimeCategory.findByPk(id);
  if (!category) {
    throw new NotFoundException('CID Crime Category', id);
  }

  await category.update({
    active: false,
    updatedBy: req.user.id
  });

  res.json(ResponseFormatter.success(category, 'CID crime category deactivated successfully'));
}));

/**
 * @swagger
 * /cid/crime-categories/{id}:
 *   delete:
 *     tags: [CID]
 *     summary: Delete CID crime category
 *     description: Delete a CID crime category (Admin access required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: CID Crime Category ID
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: CID crime category deleted successfully
 */
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), ErrorHandler.asyncHandler(async (req, res) => {
  const { id } = req.params;

  const category = await CIDCrimeCategory.findByPk(id);
  if (!category) {
    throw new NotFoundException('CID Crime Category', id);
  }

  await category.destroy();

  res.json(ResponseFormatter.success(null, 'CID crime category deleted successfully'));
}));

module.exports = router;