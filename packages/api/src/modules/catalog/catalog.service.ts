import { CatalogRepository } from './catalog.repository.js';
import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

export class CatalogService {
  constructor(private repo: CatalogRepository) {}

  async getProducts(filters: { search?: string; page: number; pageSize: number }) { return this.repo.findAll(filters); }
  async getProductById(id: string) {
    const p = await this.repo.findById(id);
    if (!p) throw Object.assign(new Error('Product not found'), { status: 404 });
    return p;
  }
  async createProduct(data: { name: string; description?: string; price: number; stock: number; imageUrl?: string }) { return this.repo.create(data); }
  async updateProduct(id: string, data: Partial<{ name: string; description: string; price: number; stock: number; imageUrl: string }>) { return this.repo.update(id, data); }
  async deleteProduct(id: string) { return this.repo.delete(id); }

  async generateImage(productName: string, description: string): Promise<string> {
    const prompt = `professional product photography of ${productName}, ${description}, clean white background, studio lighting`;
    const command = new InvokeModelCommand({
      modelId: 'amazon.nova-canvas-v1:0',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({ taskType: 'TEXT_IMAGE', textToImageParams: { text: prompt, negativeText: 'people, low quality, blurry' }, imageGenerationConfig: { numberOfImages: 1, quality: 'standard', height: 512, width: 512, cfgScale: 7.0 } }),
    });
    const response = await bedrockClient.send(command);
    const result = JSON.parse(new TextDecoder().decode(response.body));
    const imagesDir = join(process.cwd(), 'public', 'images');
    mkdirSync(imagesDir, { recursive: true });
    const filename = `${Date.now()}-${productName.replace(/\s+/g, '-').toLowerCase()}.png`;
    writeFileSync(join(imagesDir, filename), Buffer.from(result.images[0], 'base64'));
    return `/images/${filename}`;
  }
}
