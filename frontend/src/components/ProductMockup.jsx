import React from 'react';
import { Path, Rect, Line, Group } from 'react-konva';

// 400 x 500 canvas için gelişmiş, 3D görünümlü vektör ürün silüetleri.
// Her bir ürün dış gölge ve iç parlama efektleriyle gerçekçi (3D) hale getirilmiştir.

const TSHIRT =
  'M168 58 L120 42 C112 40 104 42 98 48 L44 98 C38 104 38 114 44 120 ' +
  'L78 158 C84 164 94 164 100 158 L120 140 L120 446 C120 454 126 460 134 460 ' +
  'L266 460 C274 460 280 454 280 446 L280 140 L300 158 C306 164 316 164 322 158 ' +
  'L356 120 C362 114 362 104 356 98 L302 48 C296 42 288 40 280 42 L232 58 ' +
  'C222 74 200 78 200 78 C200 78 178 74 168 58 Z';

const SWEAT =
  'M160 64 L112 46 C104 44 96 46 90 52 L36 104 C30 110 30 122 36 128 ' +
  'L74 168 C80 174 92 174 98 168 L116 148 L116 452 C116 460 122 466 130 466 ' +
  'L270 466 C278 466 284 460 284 452 L284 148 L302 168 C308 174 320 174 326 168 ' +
  'L364 128 C370 122 370 110 364 104 L310 52 C304 46 296 44 288 46 L240 64 ' +
  'C228 82 200 86 200 86 C200 86 172 82 160 64 Z';

const BABY =
  'M168 58 L120 42 C112 40 104 42 98 48 L44 98 C38 104 38 114 44 120 ' +
  'L78 158 C84 164 94 164 100 158 L120 140 L120 280 C120 340 170 380 180 380 ' +
  'L220 380 C230 380 280 340 280 280 L280 140 L300 158 C306 164 316 164 322 158 ' +
  'L356 120 C362 114 362 104 356 98 L302 48 C296 42 288 40 280 42 L232 58 ' +
  'C222 74 200 78 200 78 C200 78 178 74 168 58 Z';

const HOOD = "M150 70 C150 20 250 20 250 70 C250 100 200 110 200 110 C200 110 150 100 150 70 Z";
const CAP_DOME = "M120 220 C120 120 280 120 280 220 Z";
const CAP_VISOR = "M120 220 C120 270 60 280 60 280 L280 280 C280 240 240 220 240 220 Z";

export default function ProductMockup({ category, color }) {
  // 3D Gölge Özellikleri
  const shadowProps = {
    shadowColor: 'rgba(0,0,0,0.25)',
    shadowBlur: 20,
    shadowOffsetX: 0,
    shadowOffsetY: 10,
    listening: false,
  };

  // 3D İç Parlama (Highlight) Özellikleri - Bu kısım kumaş hissiyatı verir
  const highlightProps = {
    fill: null,
    stroke: 'rgba(255,255,255,0.6)',
    strokeWidth: 3,
    listening: false,
  };

  // İç ve dış hatları otomatik birleştirerek 3D obje yaratan yardımcı bileşen
  const RealisticPath = ({ data }) => (
    <Group>
      {/* 1. Katman: Renk ve dış gölge */}
      <Path data={data} fill={color} stroke="rgba(0,0,0,0.05)" strokeWidth={1} {...shadowProps} />
      {/* 2. Katman: Parlama ve Hacim efekti */}
      <Path data={data} {...highlightProps} />
    </Group>
  );

  switch (category) {
    case 'tshirt':
    case 'polo':
      return (
        <Group>
          <RealisticPath data={TSHIRT} />
          {category === 'polo' && (
            <Group>
              <Path data="M178 60 L200 90 L222 60" stroke="rgba(0,0,0,0.15)" strokeWidth={3} listening={false} />
              <Path data="M178 60 L200 90 L222 60" stroke="rgba(255,255,255,0.5)" strokeWidth={1} listening={false} offsetX={-1} offsetY={-1} />
            </Group>
          )}
        </Group>
      );

    case 'sweatshirt':
    case 'hoodie':
      return (
        <Group>
          {category === 'hoodie' && <RealisticPath data={HOOD} />}
          <RealisticPath data={SWEAT} />
          {(category === 'sweatshirt' || category === 'hoodie') && (
            <Group>
              <Line points={[150, 360, 250, 360]} stroke="rgba(0,0,0,0.15)" strokeWidth={3} listening={false} />
              <Line points={[150, 362, 250, 362]} stroke="rgba(255,255,255,0.4)" strokeWidth={1} listening={false} />
            </Group>
          )}
        </Group>
      );

    case 'mug':
      return (
        <Group>
          {/* Kulp (Gerçekçi Hacim) */}
          <Path data="M260 200 C330 200 330 320 260 320" stroke={color} strokeWidth={24} listening={false} {...shadowProps} />
          <Path data="M260 200 C330 200 330 320 260 320" {...highlightProps} />
          {/* Gövde */}
          <Rect x={130} y={170} width={140} height={170} cornerRadius={12} fill={color} stroke="rgba(0,0,0,0.05)" strokeWidth={1} listening={false} {...shadowProps} />
          <Rect x={130} y={170} width={140} height={170} cornerRadius={12} {...highlightProps} />
        </Group>
      );

    case 'cap':
    case 'hat':
      return (
        <Group>
          <RealisticPath data={CAP_DOME} />
          <RealisticPath data={CAP_VISOR} />
        </Group>
      );

    case 'pillow':
      return (
        <Group>
          <Rect x={90} y={120} width={220} height={220} cornerRadius={40} fill={color} stroke="rgba(0,0,0,0.05)" strokeWidth={1} listening={false} {...shadowProps} />
          <Rect x={90} y={120} width={220} height={220} cornerRadius={40} {...highlightProps} />
          {/* Yastık Kırışıklıkları */}
          <Path data="M 120 150 Q 140 170 120 190" stroke="rgba(0,0,0,0.1)" strokeWidth={3} listening={false} />
          <Path data="M 280 310 Q 260 290 280 270" stroke="rgba(0,0,0,0.1)" strokeWidth={3} listening={false} />
        </Group>
      );

    case 'bag':
      return (
        <Group>
          {/* Askılar */}
          <Path data="M 150 160 C 150 30 250 30 250 160" stroke={color} strokeWidth={14} listening={false} {...shadowProps} />
          <Path data="M 150 160 C 150 30 250 30 250 160" {...highlightProps} />
          {/* Gövde */}
          <Rect x={100} y={150} width={200} height={240} cornerRadius={8} fill={color} listening={false} {...shadowProps} />
          <Rect x={100} y={150} width={200} height={240} cornerRadius={8} {...highlightProps} />
        </Group>
      );

    case 'phonecase':
      return (
        <Group>
          <Rect x={130} y={100} width={140} height={280} cornerRadius={24} fill={color} listening={false} {...shadowProps} />
          <Rect x={130} y={100} width={140} height={280} cornerRadius={24} {...highlightProps} />
          {/* Kamera deliği */}
          <Rect x={145} y={115} width={35} height={40} cornerRadius={8} fill="#2a2a2a" listening={false} shadowColor="rgba(0,0,0,0.5)" shadowBlur={4} shadowOffsetX={2} shadowOffsetY={2} />
          <Rect x={145} y={115} width={35} height={40} cornerRadius={8} fill={null} stroke="rgba(255,255,255,0.1)" strokeWidth={1} listening={false} />
        </Group>
      );

    case 'canvas':
      return (
        <Group>
          <Rect x={100} y={100} width={200} height={280} cornerRadius={2} fill={color} listening={false} shadowColor="rgba(0,0,0,0.3)" shadowBlur={25} shadowOffsetX={15} shadowOffsetY={15} />
          <Rect x={100} y={100} width={200} height={280} cornerRadius={2} {...highlightProps} />
          {/* İç çerçeve gerginliği (Kanvas dokusu hissiyatı) */}
          <Rect x={106} y={106} width={188} height={268} fill={null} stroke="rgba(0,0,0,0.05)" strokeWidth={1} listening={false} />
        </Group>
      );

    case 'baby':
      return (
        <Group>
          <RealisticPath data={BABY} />
        </Group>
      );

    default:
      return (
        <Group>
          <RealisticPath data={TSHIRT} />
        </Group>
      );
  }
}

// Yeni eklenen tüm 11 kategoriye göre baskı (tasarım) alanı kılavuzu
export function getPrintArea(category) {
  switch (category) {
    case 'mug':
      return { x: 145, y: 190, width: 110, height: 130 };
    case 'cap':
    case 'hat':
      return { x: 140, y: 170, width: 120, height: 50 };
    case 'pillow':
      return { x: 110, y: 140, width: 180, height: 180 };
    case 'sweatshirt':
    case 'hoodie':
      return { x: 145, y: 165, width: 110, height: 170 };
    case 'bag':
      return { x: 120, y: 190, width: 160, height: 170 };
    case 'phonecase':
      return { x: 135, y: 160, width: 130, height: 210 };
    case 'canvas':
      return { x: 100, y: 100, width: 200, height: 280 };
    case 'baby':
      return { x: 145, y: 145, width: 110, height: 120 };
    default: // tshirt, polo, diğer
      return { x: 140, y: 155, width: 120, height: 180 };
  }
}