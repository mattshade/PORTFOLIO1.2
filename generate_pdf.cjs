const PDFDocument = require('pdfkit');
const fs = require('fs');

const doc = new PDFDocument({ size: 'A4', margin: 50 });
doc.pipe(fs.createWriteStream('architectural_birds.pdf'));

doc.fontSize(24).text('Matt Shade', { align: 'center' });
doc.fontSize(14).fillColor('gray').text('Portfolio & Architectural Boids', { align: 'center' });
doc.moveDown(2);

// Image
const imagePath = '/Users/mattshade/.gemini/antigravity/brain/f00472e9-c11b-40fd-9573-b529d63bdf2e/architectural_birds_1776737416308.png';
doc.image(imagePath, {
    fit: [500, 400],
    align: 'center',
    valign: 'center'
});

doc.moveDown(20);
doc.fontSize(18).fillColor('#0056b3')
   .text('Click Here to Visit My Digital Portfolio', {
       link: 'https://mattshade.com',
       underline: true,
       align: 'center'
   });

doc.end();
console.log('PDF generated successfully.');
