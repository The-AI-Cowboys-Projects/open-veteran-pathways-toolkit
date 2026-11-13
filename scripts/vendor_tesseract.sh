#!/usr/bin/env bash
# Vendor the local Tesseract.js files Scam Guardian needs for offline OCR.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$ROOT/scam-guardian/vendor/tesseract"
WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
cd "$WORK"
npm pack tesseract.js@7.0.0 >/dev/null
npm pack tesseract.js-core@7.0.0 >/dev/null
npm pack @tesseract.js-data/eng@1.0.0 >/dev/null
mkdir -p "$DEST/core"
tar -xzf tesseract.js-7.0.0.tgz \
  package/dist/tesseract.min.js \
  package/dist/tesseract.min.js.LICENSE.txt \
  package/dist/worker.min.js \
  package/dist/worker.min.js.LICENSE.txt \
  package/LICENSE.md
tar -xzf tesseract.js-core-7.0.0.tgz \
  package/LICENSE \
  package/tesseract-core-lstm.wasm.js \
  package/tesseract-core-simd-lstm.wasm.js \
  package/tesseract-core-relaxedsimd-lstm.wasm.js
tar -xzf tesseract.js-data-eng-1.0.0.tgz package/4.0.0_best_int/eng.traineddata.gz package/README.md
cp package/dist/tesseract.min.js "$DEST/tesseract.min.js"
cp package/dist/tesseract.min.js.LICENSE.txt "$DEST/tesseract.min.js.LICENSE.txt"
cp package/dist/worker.min.js "$DEST/worker.min.js"
cp package/dist/worker.min.js.LICENSE.txt "$DEST/worker.min.js.LICENSE.txt"
cp package/LICENSE.md "$DEST/LICENSE.tesseract.js.md"
cp package/LICENSE "$DEST/LICENSE.tesseract.js-core"
cp package/tesseract-core-lstm.wasm.js "$DEST/core/tesseract-core-lstm.wasm.js"
cp package/tesseract-core-simd-lstm.wasm.js "$DEST/core/tesseract-core-simd-lstm.wasm.js"
cp package/tesseract-core-relaxedsimd-lstm.wasm.js "$DEST/core/tesseract-core-relaxedsimd-lstm.wasm.js"
cp package/4.0.0_best_int/eng.traineddata.gz "$DEST/eng.traineddata.gz"
cp package/README.md "$DEST/README.eng.md"
cat > "$DEST/NOTICE" << 'EOF'
Offline OCR files for Scam Guardian.

tesseract.js 7.0.0
  https://github.com/naptha/tesseract.js
  Apache License 2.0. Copyright notices for bundled MIT/BSD pieces are in
  tesseract.min.js.LICENSE.txt and worker.min.js.LICENSE.txt
  (regenerator-runtime MIT, buffer MIT, ieee754 BSD-3-Clause, zlib.js MIT).

tesseract.js-core 7.0.0
  https://github.com/naptha/tesseract.js-core
  Apache License 2.0. LSTM-only builds are included:
  tesseract-core-lstm.wasm.js, tesseract-core-simd-lstm.wasm.js,
  and tesseract-core-relaxedsimd-lstm.wasm.js.
  The core bundles Tesseract OCR and its libraries (Leptonica, libjpeg,
  libpng, libtiff, giflib, zlib, and others). See LICENSE.tesseract.js-core.

English traineddata
  @tesseract.js-data/eng 1.0.0 file 4.0.0_best_int/eng.traineddata.gz
  The npm package declares MIT. The underlying tessdata project
  (https://github.com/tesseract-ocr/tessdata, integerized best models)
  is Apache License 2.0. Both notices are kept.

These files are used only in the browser on this device. The page does not
call a cloud OCR service.
EOF
find "$DEST" -type f -printf '%s %p\n' | sort -n
echo "vendored into $DEST"
