import React from 'react';
import { Path, Rect, Ellipse, Line } from 'react-konva';

// 400 x 500 canvas için vektör ürün silüetleri.
// Not: Bunlar basit vektör mockuplardır (fotoğraf değil). Ürün rengiyle dolar.

const TSHIRT =
  'M168 58 L120 42 C112 40 104 42 98 48 L44 98 C38 104 38 114 44 120 ' +
  'L78 158 C84 164 94 164 100 158 L120 140 L120 446 C120 454 126 460 134 460 ' +
  'L266 460 C274 460 280 454 280 446 L280 140 L300 158 C306 164 316 164 322 158 ' +
  'L356 120 C362 114 362 104 356 98 L302 48 C296 42 288 40 280 42 L232 58 ' +
  'C222 74 200 78 200 78 C200 78 178 74 168 58 Z';

// Sweatshirt / kapşonlu: tişörte göre daha hacimli gövde + kol manşetleri
const SWEAT =
  'M160 64 L112 46 C104 44 96 46 90 52 L36 104 C30 110 30 122 36 128 ' +
  'L74 168 C80 174 92 174 98 168 L116 148 L116 452 C116 460 122 466 130 466 ' +
  'L270 466 C278 466 284 460 284 452 L284 148 L302 168 C308 174 320 174 326 168 ' +
  'L364 128 C370 122 370 110 364 104 L310 52 C304 46 296 44 288 46 L240 64 ' +
  'C228 82 200 86 200 86 C200 86 172 82 160 64 Z';

export default function ProductMockup({ category, color }) {
  const fillProps = {
    fill: color,
    stroke: '#cfd4da',
    strokeWidth: 2,
    listening: false,
    shadowColor: 'rgba(0,0,0,0.12)',
    shadowBlur: 14,
    shadowOffsetX: 0,
    shadowOffsetY: 5
  };

  switch (category) {
    case 'tshirt':
    case 'polo':
      return (
        <>
          <Path data={TSHIRT} {...fillProps} />
          {category === 'polo' && (
            // polo yaka çizgisi
            <Path
              data="M178 60 L200 86 L222 60"
              stroke="#cfd4da"
              strokeWidth={2}
              listening={false}
            />
          )}
        </>
      );

    case 'sweatshirt':
    case 'hoodie':
      return (
        <>
          {/* kapşon (gövdenin arkasında) */}
          <Path
            data="M150 70 C150 30 250 30 250 70 C250 96 200 104 200 104 C200 104 150 96 150 70 Z"
            {...fillProps}
          />
          <Path data={SWEAT} {...fillProps} />
          {/* ön cep çizgisi */}
          <Line
            points={[150, 360, 250, 360]}
            stroke="#cfd4da"
            strokeWidth={2}
            listening={false}
          />
        </>
      );

    case 'mug':
      return (
        <>
          {/* gövde */}
          <Rect
            x={140}
            y={180}
            width={130}
            height={160}
            cornerRadius={10}
            {...fillProps}
          />
          {/* kulp */}
          <Path
            data="M270 210 C320 210 320 310 270 310"
            stroke={color}
            strokeWidth={18}
            fill={null}
            listening={false}
          />
          <Path
            data="M270 210 C320 210 320 310 270 310"
            stroke="#cfd4da"
            strokeWidth={2}
            fill={null}
            listening={false}
          />
        </>
      );

    case 'cap':
      return (
        <>
          {/* kubbe */}
          <Path
            data="M120 250 C120 160 280 160 280 250 Z"
            {...fillProps}
          />
          {/* siperlik */}
          <Path
            data="M120 250 C120 290 70 300 70 300 L280 300 C280 270 250 250 250 250 Z"
            {...fillProps}
          />
        </>
      );

    case 'pillow':
      return (
        <Rect
          x={90}
          y={120}
          width={220}
          height={220}
          cornerRadius={28}
          {...fillProps}
        />
      );

    default:
      return (
        <Rect
          x={110}
          y={90}
          width={180}
          height={320}
          cornerRadius={16}
          {...fillProps}
        />
      );
  }
}

// Kategoriye göre baskı (tasarım) alanı kılavuzu — kesik çizgili dikdörtgen
export function getPrintArea(category) {
  switch (category) {
    case 'mug':
      return { x: 150, y: 200, width: 110, height: 120 };
    case 'cap':
      return { x: 140, y: 195, width: 120, height: 50 };
    case 'pillow':
      return { x: 120, y: 150, width: 160, height: 160 };
    case 'sweatshirt':
    case 'hoodie':
      return { x: 145, y: 165, width: 110, height: 170 };
    default: // tshirt, polo, diğer
      return { x: 140, y: 155, width: 120, height: 180 };
  }
}
