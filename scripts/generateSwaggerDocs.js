const fs = require('fs');
const path = require('path');

/**
 * Auto-generate basic Swagger documentation for controllers
 * This script adds basic Swagger JSDoc comments to controller files that don't have them yet
 */

const controllersDir = path.join(__dirname, '../src/controllers');
const outputDir = path.join(__dirname, '../docs/generated');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Controller mappings - define the tag and basic info for each controller
const controllerMappings = {
  'stateController.js': {
    tag: 'Geography',
    resourceName: 'states',
    entityName: 'State',
    description: 'State management operations'
  },
  'districtController.js': {
    tag: 'Geography', 
    resourceName: 'districts',
    entityName: 'District',
    description: 'District management operations'
  },
  'rangeController.js': {
    tag: 'Geography',
    resourceName: 'ranges', 
    entityName: 'Range',
    description: 'Range management operations'
  },
  'moduleController.js': {
    tag: 'Content',
    resourceName: 'modules',
    entityName: 'Module', 
    description: 'Module management operations'
  },
  'topicController.js': {
    tag: 'Content',
    resourceName: 'topics',
    entityName: 'Topic',
    description: 'Topic management operations'
  },
  'subTopicController.js': {
    tag: 'Content',
    resourceName: 'sub-topics',
    entityName: 'SubTopic',
    description: 'Sub-topic management operations'
  },
  'questionController.js': {
    tag: 'Content',
    resourceName: 'questions', 
    entityName: 'Question',
    description: 'Question management operations'
  },
  'menuController.js': {
    tag: 'Content',
    resourceName: 'menus',
    entityName: 'Menu',
    description: 'Menu management operations'
  },
  'communicationController.js': {
    tag: 'Communications',
    resourceName: 'communications',
    entityName: 'Communication',
    description: 'Communication and messaging operations'
  },
  'reportController.js': {
    tag: 'Reports',
    resourceName: 'reports',
    entityName: 'Report',
    description: 'Report generation and analytics operations'
  }
};

// Basic CRUD operation templates
const operationTemplates = {
  GET: (config, hasParams = false) => `/**
 * @swagger
 * /${config.resourceName}${hasParams ? '/{id}' : ''}:
 *   get:
 *     tags: [${config.tag}]
 *     summary: ${hasParams ? `Get ${config.entityName.toLowerCase()} by ID` : `Get all ${config.resourceName}`}
 *     description: ${hasParams ? `Retrieve a specific ${config.entityName.toLowerCase()} by its ID` : `Retrieve a list of ${config.resourceName} with optional filtering and pagination`}
 *     security:
 *       - bearerAuth: []${hasParams ? `
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ${config.entityName} ID
 *         schema:
 *           type: integer
 *           example: 1` : `
 *     parameters:
 *       - $ref: '#/components/parameters/PageParam'
 *       - $ref: '#/components/parameters/LimitParam'
 *       - $ref: '#/components/parameters/SearchParam'
 *       - name: active
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *           default: true`}
 *     responses:
 *       200:
 *         description: ${hasParams ? `${config.entityName} retrieved successfully` : `${config.resourceName} retrieved successfully`}
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:${hasParams ? `
 *                       $ref: '#/components/schemas/${config.entityName}'` : `
 *                       type: object
 *                       properties:
 *                         ${config.resourceName}:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/${config.entityName}'
 *                         pagination:
 *                           $ref: '#/components/schemas/PaginationMeta'`}
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'${hasParams ? `
 *       404:
 *         $ref: '#/components/responses/NotFound'` : ''}
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */`,

  POST: (config) => `/**
 * @swagger
 * /${config.resourceName}:
 *   post:
 *     tags: [${config.tag}]
 *     summary: Create new ${config.entityName.toLowerCase()}
 *     description: Create a new ${config.entityName.toLowerCase()} record
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Example ${config.entityName}"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Description for the ${config.entityName.toLowerCase()}"
 *               isActive:
 *                 type: boolean
 *                 default: true
 *                 example: true
 *     responses:
 *       201:
 *         description: ${config.entityName} created successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/${config.entityName}'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       409:
 *         description: ${config.entityName} already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */`,

  PUT: (config) => `/**
 * @swagger
 * /${config.resourceName}/{id}:
 *   put:
 *     tags: [${config.tag}]
 *     summary: Update ${config.entityName.toLowerCase()}
 *     description: Update an existing ${config.entityName.toLowerCase()} record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ${config.entityName} ID
 *         schema:
 *           type: integer
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 example: "Updated ${config.entityName}"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "Updated description"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: ${config.entityName} updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/SuccessResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       $ref: '#/components/schemas/${config.entityName}'
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
 */`,

  DELETE: (config) => `/**
 * @swagger
 * /${config.resourceName}/{id}:
 *   delete:
 *     tags: [${config.tag}]
 *     summary: Delete ${config.entityName.toLowerCase()}
 *     description: Delete an existing ${config.entityName.toLowerCase()} record
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: ${config.entityName} ID
 *         schema:
 *           type: integer
 *           example: 1
 *     responses:
 *       200:
 *         description: ${config.entityName} deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */`
};

// Function to detect route patterns and generate documentation
function generateSwaggerForController(controllerPath, config) {
  const content = fs.readFileSync(controllerPath, 'utf8');
  const lines = content.split('\n');
  const documentedContent = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Look for route definitions that don't already have Swagger docs
    if (line.includes('router.get(') || line.includes('router.post(') || 
        line.includes('router.put(') || line.includes('router.delete(')) {
      
      // Check if previous lines already contain @swagger
      const prevLines = lines.slice(Math.max(0, i - 10), i).join('');
      if (prevLines.includes('@swagger')) {
        documentedContent.push(line);
        continue;
      }
      
      // Extract method and path
      const routeMatch = line.match(/router\.(get|post|put|delete)\s*\(\s*['"`]([^'"`]+)['"`]/);
      if (routeMatch) {
        const [, method, routePath] = routeMatch;
        
        // Generate appropriate documentation based on route pattern
        let swaggerDoc = '';
        if (method.toUpperCase() === 'GET') {
          const hasParams = routePath.includes(':id') || routePath.includes(':');
          swaggerDoc = operationTemplates.GET(config, hasParams);
        } else if (method.toUpperCase() === 'POST') {
          swaggerDoc = operationTemplates.POST(config);
        } else if (method.toUpperCase() === 'PUT') {
          swaggerDoc = operationTemplates.PUT(config);
        } else if (method.toUpperCase() === 'DELETE') {
          swaggerDoc = operationTemplates.DELETE(config);
        }
        
        if (swaggerDoc) {
          documentedContent.push(swaggerDoc);
        }
      }
    }
    
    documentedContent.push(line);
  }
  
  return documentedContent.join('\n');
}

// Generate documentation for all mapped controllers
function generateAllDocumentation() {
  const results = [];
  
  Object.entries(controllerMappings).forEach(([filename, config]) => {
    const controllerPath = path.join(controllersDir, filename);
    
    if (fs.existsSync(controllerPath)) {
      try {
        const documentedContent = generateSwaggerForController(controllerPath, config);
        const outputPath = path.join(outputDir, `documented_${filename}`);
        
        fs.writeFileSync(outputPath, documentedContent);
        results.push({
          controller: filename,
          status: 'success',
          outputPath: outputPath
        });
        
        console.log(`✅ Generated documentation for ${filename}`);
      } catch (error) {
        results.push({
          controller: filename,
          status: 'error',
          error: error.message
        });
        
        console.error(`❌ Error processing ${filename}:`, error.message);
      }
    } else {
      results.push({
        controller: filename,
        status: 'not_found',
        error: 'Controller file not found'
      });
      
      console.warn(`⚠️  Controller not found: ${filename}`);
    }
  });
  
  // Generate summary report
  const report = {
    timestamp: new Date().toISOString(),
    total: results.length,
    successful: results.filter(r => r.status === 'success').length,
    failed: results.filter(r => r.status === 'error').length,
    notFound: results.filter(r => r.status === 'not_found').length,
    results: results
  };
  
  fs.writeFileSync(path.join(outputDir, 'generation_report.json'), JSON.stringify(report, null, 2));
  
  console.log(`\n📊 Generation Summary:`);
  console.log(`   Total controllers: ${report.total}`);
  console.log(`   Successfully processed: ${report.successful}`);
  console.log(`   Errors: ${report.failed}`);
  console.log(`   Not found: ${report.notFound}`);
  console.log(`\n📄 Report saved to: ${path.join(outputDir, 'generation_report.json')}`);
  
  return report;
}

// Main execution
if (require.main === module) {
  console.log('🚀 Starting Swagger documentation generation...\n');
  generateAllDocumentation();
  console.log('\n✨ Documentation generation complete!');
  console.log('📝 Review the generated files in docs/generated/ directory');
  console.log('🔄 Copy the generated content back to your controller files as needed');
}

module.exports = {
  generateSwaggerForController,
  generateAllDocumentation,
  controllerMappings,
  operationTemplates
};