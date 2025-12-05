/**
 * Template Manager for Docxtemplater
 * Handles template file uploads and storage
 */

export interface TemplateInfo {
  id: string;
  name: string;
  description?: string;
  lastModified: Date;
  size: number;
}

class TemplateManager {
  private templates: Map<string, ArrayBuffer> = new Map();
  private templateInfo: Map<string, TemplateInfo> = new Map();
  private defaultTemplateLoaded = false;

  /**
   * Upload and store a new template
   */
  async uploadTemplate(file: File): Promise<TemplateInfo> {
    try {
      const buffer = await file.arrayBuffer();
      const id = this.generateTemplateId();
      
      const templateInfo: TemplateInfo = {
        id,
        name: file.name,
        description: `Uploaded on ${new Date().toLocaleDateString()}`,
        lastModified: new Date(file.lastModified),
        size: file.size,
      };

      this.templates.set(id, buffer);
      this.templateInfo.set(id, templateInfo);

      // Save to localStorage for persistence
      this.saveToLocalStorage();

      return templateInfo;
    } catch (error) {
      console.error('Error uploading template:', error);
      throw new Error('Failed to upload template');
    }
  }

  /**
   * Get a template by ID
   */
  getTemplate(id: string): ArrayBuffer | null {
    return this.templates.get(id) || null;
  }

  /**
   * Get template info by ID
   */
  getTemplateInfo(id: string): TemplateInfo | null {
    return this.templateInfo.get(id) || null;
  }

  /**
   * Get all available templates
   */
  getAllTemplates(): TemplateInfo[] {
    return Array.from(this.templateInfo.values());
  }

  /**
   * Delete a template
   */
  deleteTemplate(id: string): boolean {
    const deleted = this.templates.delete(id) && this.templateInfo.delete(id);
    if (deleted) {
      this.saveToLocalStorage();
    }
    return deleted;
  }

  /**
   * Check if a template exists
   */
  hasTemplate(id: string): boolean {
    return this.templates.has(id);
  }

  /**
   * Get the default template (first available or null)
   */
  getDefaultTemplate(): ArrayBuffer | null {
    const templates = this.getAllTemplates();
    if (templates.length === 0) {
      return null;
    }
    return this.getTemplate(templates[0].id);
  }

  /**
   * Load the built-in default template
   */
  async loadDefaultTemplate(): Promise<void> {
    if (this.defaultTemplateLoaded) {
      return;
    }

    try {
      // Import the default template file
      const response = await fetch('/templates/wordTemplate.docx');
      if (!response.ok) {
        throw new Error('Failed to load default template');
      }
      
      const buffer = await response.arrayBuffer();
      const templateInfo: TemplateInfo = {
        id: 'default_template',
        name: 'Default Unit Plan Template',
        description: 'Built-in default template for unit plans',
        lastModified: new Date(),
        size: buffer.byteLength,
      };

      this.templates.set('default_template', buffer);
      this.templateInfo.set('default_template', templateInfo);
      this.defaultTemplateLoaded = true;

      // Save to localStorage
      this.saveToLocalStorage();
    } catch (error) {
      console.warn('Could not load default template:', error);
    }
  }

  /**
   * Generate a unique template ID
   */
  private generateTemplateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Save templates to localStorage
   */
  private saveToLocalStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const templateData = Array.from(this.templateInfo.entries()).map(([id, info]) => ({
        id,
        info,
        data: Array.from(new Uint8Array(this.templates.get(id)!))
      }));

      localStorage.setItem('docxtemplater_templates', JSON.stringify(templateData));
    } catch (error) {
      console.warn('Could not save templates to localStorage:', error);
    }
  }

  /**
   * Load templates from localStorage
   */
  loadFromLocalStorage(): void {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return;
      }

      const stored = localStorage.getItem('docxtemplater_templates');
      if (!stored) return;

      const templateData = JSON.parse(stored);
      
      templateData.forEach((item: { id: string; info: TemplateInfo; data: number[] }) => {
        const buffer = new Uint8Array(item.data).buffer;
        this.templates.set(item.id, buffer);
        this.templateInfo.set(item.id, item.info);
      });
    } catch (error) {
      console.warn('Could not load templates from localStorage:', error);
    }
  }

  /**
   * Clear all templates
   */
  clearAllTemplates(): void {
    this.templates.clear();
    this.templateInfo.clear();
    
    // Check if we're in a browser environment
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem('docxtemplater_templates');
    }
  }
}

// Export singleton instance
export const templateManager = new TemplateManager();

// Load templates on module initialization
templateManager.loadFromLocalStorage();



