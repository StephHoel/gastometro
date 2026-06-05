/** @type {import('tailwindcss').Config} */
export const content = [
  './src/app/**/*.{ts,tsx}', 
  './src/components/**/*.{ts,tsx}'
];

export const presets = [require("nativewind/preset")];

export const theme = {
  extend: {
    fontFamily: {
      heading: 'System',
      subtitle: 'System',
      body: 'System',
      bold: 'System',
    },
  },
};

export const plugins = [];
