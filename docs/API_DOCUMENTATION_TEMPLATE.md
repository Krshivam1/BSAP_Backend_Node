# API Documentation Template

This template provides Swagger/OpenAPI documentation examples for all controllers. Copy and customize these examples for your specific endpoints.

## Basic Documentation Structure

```javascript
/**
 * @swagger
 * /endpoint-path:
 *   method:
 *     tags: [TagName]
 *     summary: Brief description
 *     description: Detailed description
 *     security:
 *       - bearerAuth: []  // Remove for public endpoints
 *     parameters:
 *       - name: paramName
 *         in: path|query|header
 *         required: true|false
 *         description: Parameter description
 *         schema:
 *           type: string|integer|boolean
 *           example: exampleValue
 *     requestBody:  // For POST/PUT/PATCH requests
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SchemaName'
 *           examples:
 *             exampleName:
 *               summary: Example summary
 *               value:
 *                 field1: "value1"
 *                 field2: "value2"
 *     responses:
 *       200:
 *         description: Success description
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object  // or array, etc.
 *                       properties:
 *                         // Define response data structure
 *             examples:
 *               successExample:
 *                 summary: Success example
 *                 value:
 *                   success: true
 *                   message: "Operation successful"
 *                   data: {}
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
```

## Controller-Specific Templates

### Geography Controller (/states, /districts, /ranges)

```javascript
/**
 * @swagger
 * /states:
 *   get:
 *     tags: [Geography]
 *     summary: Get all states
 *     description: Retrieve a list of all states with optional filtering
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: States retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         states:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/State'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 */
```

### Performance Statistics Controller

```javascript
/**
 * @swagger
 * /performance-statistics:
 *   get:
 *     tags: [Performance]
 *     summary: Get performance statistics
 *     description: Retrieve performance statistics with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - name: userId
 *         in: query
 *         description: Filter by user ID
 *         schema:
 *           type: integer
 *       - name: moduleId
 *         in: query
 *         description: Filter by module ID
 *         schema:
 *           type: integer
 *       - name: startDate
 *         in: query
 *         description: Filter by start date (ISO format)
 *         schema:
 *           type: string
 *           format: date
 *       - name: endDate
 *         in: query
 *         description: Filter by end date (ISO format)
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Performance statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         statistics:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/PerformanceStatistic'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'
 */

/**
 * @swagger
 * /performance-statistics:
 *   post:
 *     tags: [Performance]
 *     summary: Submit performance statistics
 *     description: Submit new performance statistics for a user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [moduleId, score, maxScore, timeTaken]
 *             properties:
 *               moduleId:
 *                 type: integer
 *                 example: 1
 *               score:
 *                 type: number
 *                 format: float
 *                 example: 85.5
 *               maxScore:
 *                 type: number
 *                 format: float
 *                 example: 100
 *               timeTaken:
 *                 type: integer
 *                 example: 3600
 *                 description: Time taken in seconds
 *               status:
 *                 type: string
 *                 enum: [COMPLETED, IN_PROGRESS, ABANDONED]
 *                 default: COMPLETED
 *     responses:
 *       201:
 *         description: Performance statistics submitted successfully
 */
```

### File Controller

```javascript
/**
 * @swagger
 * /files/upload/{type}:
 *   post:
 *     tags: [Files]
 *     summary: Upload single file
 *     description: Upload a single file to the specified category
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: type
 *         in: path
 *         required: false
 *         description: File category type
 *         schema:
 *           type: string
 *           enum: [general, images, documents, spreadsheets]
 *           default: general
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/FileUpload'
 *       400:
 *         description: Invalid file or file type not allowed
 */
```

### Admin Controller

```javascript
/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard data
 *     description: Retrieve comprehensive dashboard statistics for administrators
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         statistics:
 *                           type: object
 *                           properties:
 *                             totalUsers:
 *                               type: integer
 *                               example: 150
 *                             totalStates:
 *                               type: integer
 *                               example: 5
 *                             totalDistricts:
 *                               type: integer
 *                               example: 25
 *                             totalPerformanceRecords:
 *                               type: integer
 *                               example: 1000
 *                         recentActivity:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: integer
 *                               user:
 *                                 type: string
 *                               score:
 *                                 type: number
 *                               submissionDate:
 *                                 type: string
 *                                 format: date-time
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
```

## Common Error Responses

All endpoints should include these standard error responses:

```javascript
*       400:
*         $ref: '#/components/responses/BadRequest'
*       401:
*         $ref: '#/components/responses/Unauthorized'
*       403:
*         $ref: '#/components/responses/Forbidden'
*       404:
*         $ref: '#/components/responses/NotFound'
*       500:
*         $ref: '#/components/responses/InternalServerError'
```

## Security Requirements

For protected endpoints, always include:

```javascript
*     security:
*       - bearerAuth: []
```

For public endpoints, use:

```javascript
*     security: []
```

## Common Parameters

Use these standard parameters where applicable:

```javascript
*     parameters:
*       - $ref: '#/components/parameters/PageParam'
*       - $ref: '#/components/parameters/LimitParam'
*       - $ref: '#/components/parameters/SearchParam'
*       - $ref: '#/components/parameters/SortParam'
```

## Implementation Guidelines

1. **Add documentation to all controller files** - Each endpoint should have comprehensive Swagger documentation
2. **Use consistent response formats** - All responses should follow the standard SuccessResponse/ErrorResponse format
3. **Include examples** - Provide realistic examples for both requests and responses
4. **Document all parameters** - Include all query parameters, path parameters, and request body fields
5. **Specify security requirements** - Clearly indicate which endpoints require authentication
6. **Group related endpoints** - Use appropriate tags to group related functionality
7. **Include validation rules** - Document required fields, data types, and constraints

## Next Steps

1. Apply these templates to all remaining controllers:
   - stateController.js
   - districtController.js
   - rangeController.js
   - moduleController.js
   - topicController.js
   - subTopicController.js
   - questionController.js
   - menuController.js
   - performanceStatisticController.js
   - communicationController.js
   - reportController.js
   - cidController.js (all CID-related controllers)

2. Test the documentation by visiting `/api/docs` in your browser

3. Customize the styling and branding in the swagger configuration

4. Add API versioning if needed

5. Export documentation to external formats (JSON, YAML) for API consumers