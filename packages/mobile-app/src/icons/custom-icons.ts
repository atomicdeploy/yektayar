/**
 * Custom Ionic Icons for YektaYar
 * 
 * This module registers custom SVG icons that can be used with ion-icon components.
 * Icons are imported from SVG files and registered with the addIcons function.
 */

import { addIcons } from 'ionicons'
import yektayarLogoSvg from './logo.svg?raw'

/**
 * Register all custom icons
 * 
 * This function should be called once during app initialization (in main.ts)
 * to register all custom icons with the ionicons library.
 * 
 * The YektaYar logo is loaded from logo.svg file and registered as 'yektayar'.
 * Usage: <ion-icon name="yektayar"></ion-icon>
 */
export function registerCustomIcons(): void {
  addIcons({
    'yektayar': yektayarLogoSvg
  })
}
