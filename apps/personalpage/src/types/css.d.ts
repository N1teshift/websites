/**
 * @module *.module.css
 * Declares the shape of CSS Modules for TypeScript.
 * Allows importing `.module.css` files and accessing class names as properties.
 */
declare module "*.module.css" {
  /**
   * A mapping from locally defined CSS class names to their globally unique generated names.
   */
  const classes: { [key: string]: string };
  export default classes;
}
