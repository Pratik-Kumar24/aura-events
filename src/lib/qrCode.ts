// ============================================================================
// PURE TYPESCRIPT ISO/IEC 18004 COMPLIANT QR CODE GENERATOR
// Zero external dependencies. Generates standard scannable QR matrices.
// Supports Versions 1 to 7 with Error Correction Level M (~15% recovery).
// ============================================================================

// GF(256) tables with primitive polynomial 0x11D (285)
const GF_EXP = new Uint8Array(512);
const GF_LOG = new Uint8Array(256);

(function initGaloisField() {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF_EXP[i] = x;
    GF_LOG[x] = i;
    x <<= 1;
    if (x & 0x100) x ^= 0x11d;
  }
  for (let i = 255; i < 512; i++) {
    GF_EXP[i] = GF_EXP[i - 255];
  }
})();

function gfMul(a: number, b: number): number {
  if (a === 0 || b === 0) return 0;
  return GF_EXP[GF_LOG[a] + GF_LOG[b]];
}

function rsGeneratorPoly(numEc: number): number[] {
  let poly = [1];
  for (let i = 0; i < numEc; i++) {
    const factor = [1, GF_EXP[i]];
    const newPoly: number[] = new Array(poly.length + 1).fill(0);
    for (let j = 0; j < poly.length; j++) {
      newPoly[j] ^= gfMul(poly[j], factor[0]);
      newPoly[j + 1] ^= gfMul(poly[j], factor[1]);
    }
    poly = newPoly;
  }
  return poly;
}

function rsComputeRemainder(data: number[], numEc: number): number[] {
  const gen = rsGeneratorPoly(numEc);
  const remainder = new Array(numEc).fill(0);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    for (let j = 0; j < numEc - 1; j++) {
      remainder[j] = remainder[j + 1] ^ gfMul(gen[j + 1], factor);
    }
    remainder[numEc - 1] = gfMul(gen[numEc], factor);
  }
  return remainder;
}

// Version table for EC Level M (Total CW, EC per block, num blocks, data CW per block)
interface VersionSpec {
  version: number;
  size: number;
  totalDataCW: number;
  ecPerBlock: number;
  blocks: { numBlocks: number; dataCW: number }[];
  alignPositions: number[];
}

const VERSION_SPECS: VersionSpec[] = [
  {
    version: 1,
    size: 21,
    totalDataCW: 16,
    ecPerBlock: 10,
    blocks: [{ numBlocks: 1, dataCW: 16 }],
    alignPositions: [],
  },
  {
    version: 2,
    size: 25,
    totalDataCW: 28,
    ecPerBlock: 16,
    blocks: [{ numBlocks: 1, dataCW: 28 }],
    alignPositions: [6, 18],
  },
  {
    version: 3,
    size: 29,
    totalDataCW: 44,
    ecPerBlock: 26,
    blocks: [{ numBlocks: 1, dataCW: 44 }],
    alignPositions: [6, 22],
  },
  {
    version: 4,
    size: 33,
    totalDataCW: 64,
    ecPerBlock: 18,
    blocks: [{ numBlocks: 2, dataCW: 32 }],
    alignPositions: [6, 26],
  },
  {
    version: 5,
    size: 37,
    totalDataCW: 86,
    ecPerBlock: 24,
    blocks: [{ numBlocks: 2, dataCW: 43 }],
    alignPositions: [6, 30],
  },
  {
    version: 6,
    size: 41,
    totalDataCW: 108,
    ecPerBlock: 16,
    blocks: [{ numBlocks: 4, dataCW: 27 }],
    alignPositions: [6, 34],
  },
  {
    version: 7,
    size: 45,
    totalDataCW: 124,
    ecPerBlock: 18,
    blocks: [
      { numBlocks: 2, dataCW: 31 },
      { numBlocks: 2, dataCW: 32 },
    ],
    alignPositions: [6, 22, 38],
  },
];

export function generateQRCodeMatrix(text: string): boolean[][] {
  const encoder = new TextEncoder();
  const utf8 = encoder.encode(text);

  // Pick smallest fitting version
  let spec = VERSION_SPECS.find((s) => s.totalDataCW >= utf8.length + 3);
  if (!spec) {
    spec = VERSION_SPECS[VERSION_SPECS.length - 1];
  }

  // 1. Bit Buffer: 4 bits mode (0100 for Byte mode) + 8 bits char count + data
  const bits: number[] = [];
  function pushBits(val: number, len: number) {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1);
    }
  }

  pushBits(0b0100, 4); // Byte mode
  pushBits(utf8.length, 8); // Char count
  for (let i = 0; i < utf8.length; i++) {
    pushBits(utf8[i], 8);
  }

  // Terminator (up to 4 bits of 0)
  const remainingBits = spec.totalDataCW * 8 - bits.length;
  pushBits(0, Math.min(4, Math.max(0, remainingBits)));

  // Pad to byte boundary
  while (bits.length % 8 !== 0) {
    bits.push(0);
  }

  // Convert bits to data codewords
  const dataCW: number[] = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j++) {
      byte = (byte << 1) | bits[i + j];
    }
    dataCW.push(byte);
  }

  // Pad codewords up to capacity with alternating 0xEC and 0x11
  const padBytes = [0xec, 0x11];
  let padIdx = 0;
  while (dataCW.length < spec.totalDataCW) {
    dataCW.push(padBytes[padIdx % 2]);
    padIdx++;
  }

  // 2. Partition into blocks and calculate EC codewords
  const blocksData: number[][] = [];
  const blocksEC: number[][] = [];
  let offset = 0;
  for (const blockInfo of spec.blocks) {
    for (let b = 0; b < blockInfo.numBlocks; b++) {
      const slice = dataCW.slice(offset, offset + blockInfo.dataCW);
      offset += blockInfo.dataCW;
      blocksData.push(slice);
      blocksEC.push(rsComputeRemainder(slice, spec.ecPerBlock));
    }
  }

  // 3. Interleave data codewords and then EC codewords
  const finalCodewords: number[] = [];
  const maxDataLen = Math.max(...blocksData.map((b) => b.length));
  for (let i = 0; i < maxDataLen; i++) {
    for (const b of blocksData) {
      if (i < b.length) finalCodewords.push(b[i]);
    }
  }
  for (let i = 0; i < spec.ecPerBlock; i++) {
    for (const ec of blocksEC) {
      finalCodewords.push(ec[i]);
    }
  }

  // 4. Populate Matrix with function patterns and data
  const N = spec.size;
  const matrix: (boolean | null)[][] = Array.from({ length: N }, () => Array(N).fill(null));
  const isFunction: boolean[][] = Array.from({ length: N }, () => Array(N).fill(false));

  function setModule(r: number, c: number, val: boolean) {
    if (r >= 0 && r < N && c >= 0 && c < N) {
      matrix[r][c] = val;
      isFunction[r][c] = true;
    }
  }

  // Finder Patterns (7x7) + Separators
  function addFinder(top: number, left: number) {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const row = top + r;
        const col = left + c;
        if (row < 0 || row >= N || col < 0 || col >= N) continue;
        if (r === -1 || r === 7 || c === -1 || c === 7) {
          setModule(row, col, false); // white separator
        } else if (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4)) {
          setModule(row, col, true); // black module
        } else {
          setModule(row, col, false); // white module
        }
      }
    }
  }

  addFinder(0, 0);
  addFinder(0, N - 7);
  addFinder(N - 7, 0);

  // Timing patterns (row 6 and col 6)
  for (let i = 8; i < N - 8; i++) {
    if (matrix[6][i] === null) setModule(6, i, i % 2 === 0);
    if (matrix[i][6] === null) setModule(i, 6, i % 2 === 0);
  }

  // Alignment patterns
  const aligns = spec.alignPositions;
  for (const r of aligns) {
    for (const c of aligns) {
      // Don't overlap with finders
      if ((r <= 8 && c <= 8) || (r <= 8 && c >= N - 8) || (r >= N - 8 && c <= 8)) continue;
      for (let dr = -2; dr <= 2; dr++) {
        for (let dc = -2; dc <= 2; dc++) {
          const isBlack = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
          setModule(r + dr, c + dc, isBlack);
        }
      }
    }
  }

  // Reserve Format Information areas
  for (let i = 0; i <= 8; i++) {
    if (matrix[8][i] === null) matrix[8][i] = false;
    if (matrix[i][8] === null) matrix[i][8] = false;
    isFunction[8][i] = true;
    isFunction[i][8] = true;
  }
  for (let i = 0; i < 8; i++) {
    if (matrix[8][N - 1 - i] === null) matrix[8][N - 1 - i] = false;
    if (matrix[N - 1 - i][8] === null) matrix[N - 1 - i][8] = false;
    isFunction[8][N - 1 - i] = true;
    isFunction[N - 1 - i][8] = true;
  }
  // Dark module
  setModule(4 * spec.version + 9, 8, true);

  // 5. Place Data Codewords (Zigzag)
  let bitIndex = 0;
  const totalDataBits = finalCodewords.length * 8;
  let upwards = true;

  for (let right = N - 1; right > 0; right -= 2) {
    if (right === 6) right--; // skip vertical timing column
    const rows = upwards
      ? Array.from({ length: N }, (_, i) => N - 1 - i)
      : Array.from({ length: N }, (_, i) => i);

    for (const r of rows) {
      for (let c = right; c >= right - 1; c--) {
        if (!isFunction[r][c]) {
          let bit = false;
          if (bitIndex < totalDataBits) {
            const byte = finalCodewords[Math.floor(bitIndex / 8)];
            const b = 7 - (bitIndex % 8);
            bit = ((byte >> b) & 1) === 1;
            bitIndex++;
          }
          // Mask 0: (r + c) % 2 === 0
          const mask = (r + c) % 2 === 0;
          matrix[r][c] = mask ? !bit : bit;
        }
      }
    }
    upwards = !upwards;
  }

  // 6. Write Format Info: EC Level M (00) + Mask 0 (000) -> 00 000
  // BCH(15, 5) code for 00 000 with mask 0x5412 is 101010000010010 (0x5412)
  const formatBits = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0];
  // Horizontal format bits around top-left & top-right
  const horizontalPositions = [
    [8, 0], [8, 1], [8, 2], [8, 3], [8, 4], [8, 5], [8, 7], [8, 8],
    [7, 8], [5, 8], [4, 8], [3, 8], [2, 8], [1, 8], [0, 8],
  ];
  for (let i = 0; i < 15; i++) {
    const [r, c] = horizontalPositions[i];
    matrix[r][c] = formatBits[i] === 1;
  }
  // Secondary format bits (under top-right and left of bottom-left)
  for (let i = 0; i < 7; i++) {
    matrix[N - 1 - i][8] = formatBits[i] === 1;
  }
  for (let i = 0; i < 8; i++) {
    matrix[8][N - 8 + i] = formatBits[7 + i] === 1;
  }

  return matrix.map((row) => row.map((m) => (m === null ? false : m)));
}
