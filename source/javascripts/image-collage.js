/**
 * Creates a collage from multiple images with intelligent layout
 * @param {string[]} imageUrls - Array of image URLs (1 or more)
 * @param {number} width - Width of the output collage in pixels
 * @param {number} height - Height of the output collage in pixels
 * @param {number} gap - Gap between images in pixels (default: 4)
 * @param {number} totalProductCount - Total number of products in category
 * @param {string} fontFamily - Font family to use for count text (default: 'sans-serif')
 * @param {boolean} showCount - Whether to show the product count (default: true)
 * @param {string} context - The display context ('single' or 'collage') (default: 'single')
 * @param {string} indicatorShape - Shape of the count indicator ('circle', 'square', 'pill', 'sunburst') (default: 'circle')
 * @param {string} indicatorColorHex - Hex color for the single image count indicator (default: '#000000')
 * @param {string} gridIndicatorColorHex - Hex color for the grid count indicator (default: '#000000')
 * @param {number} countOverlayOpacity - Opacity for the count overlay (default: 0.5)
 * @return {Promise<string>} - Promise that resolves with the data URL of the collage
 */
function createCollage(imageUrls, width = 800, height = 800, gap = 4, totalProductCount = 0, fontFamily = 'sans-serif', showCount = true, context = 'single', indicatorShape = 'circle', indicatorColorHex = '#000000', gridIndicatorColorHex = '#000000', countOverlayOpacity = 0.5) {
  return new Promise((resolve, reject) => {
    if (!imageUrls || imageUrls.length === 0) {
      reject(new Error('Please provide at least one image URL'));
      return;
    }

    const missingImagePatterns = [
      '/missing.png',
      'assets-dev.bigcartel.biz/missing.png',
      'assets.bigcartel.biz/missing.png',
      'assets.bigcartel.com/missing.png'
    ];

    const isMissingImage = (url) => {
      return missingImagePatterns.some(pattern => url.includes(pattern));
    };

    const validImageUrls = imageUrls.filter(url => !isMissingImage(url));

    // If filtering removed all images, resolve with the original first URL (likely a placeholder)
    if (validImageUrls.length === 0) {
      resolve(imageUrls[0]);
      return;
    }

    const isEffectivelySingle = validImageUrls.length === 1;
    // Use the provided total count if available, otherwise use the count of valid images.
    const actualTotalCount = totalProductCount > 0 ? totalProductCount : validImageUrls.length;

    // Handle the case where only one valid image remains
    if (isEffectivelySingle) {
      const img = new Image();
      img.crossOrigin = 'Anonymous'; // Required for canvas operations on images from other origins

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        // Optimize context creation if frequent reads aren't expected (though drawing implies reads)
        const ctx = canvas.getContext('2d', { willReadFrequently: false });

        drawCroppedImage(ctx, img, 0, 0, width, height);

        // Show count indicator only for single images (not collages) if enabled and count > 0
        if (context === 'single' && showCount && actualTotalCount >= 1) {
          addCountIndicator(ctx, width, height, actualTotalCount, fontFamily, indicatorShape, indicatorColorHex, countOverlayOpacity);
        }

        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      img.onerror = (err) => {
        console.error(`Failed to load image: ${validImageUrls[0]}`, err);
        reject(new Error(`Failed to load image: ${validImageUrls[0]}`));
      };

      img.src = validImageUrls[0];
      return;
    }

    // --- Collage Path (2 or more valid images) ---
    let layout;
    const displayCount = Math.min(validImageUrls.length, 4);

    if (displayCount === 2) {
      // Layout: 2 images side-by-side
      layout = [
        { x: 0, y: 0, w: width / 2 - gap / 2, h: height },
        { x: width / 2 + gap / 2, y: 0, w: width / 2 - gap / 2, h: height }
      ];
    }
    else if (displayCount === 3) {
      // Layout: 1 large image (left 50%), 2 small images (right 50% stacked)
      layout = [
        { x: 0, y: 0, w: width / 2 - gap / 2, h: height },
        { x: width / 2 + gap / 2, y: 0, w: width / 2 - gap / 2, h: height / 2 - gap / 2 },
        { x: width / 2 + gap / 2, y: height / 2 + gap / 2, w: width / 2 - gap / 2, h: height / 2 - gap / 2 }
      ];
    }
    else { // displayCount === 4
      // Layout: 2x2 grid
      layout = [
        { x: 0, y: 0, w: width / 2 - gap / 2, h: height / 2 - gap / 2 },
        { x: width / 2 + gap / 2, y: 0, w: width / 2 - gap / 2, h: height / 2 - gap / 2 },
        { x: 0, y: height / 2 + gap / 2, w: width / 2 - gap / 2, h: height / 2 - gap / 2 },
        { x: width / 2 + gap / 2, y: height / 2 + gap / 2, w: width / 2 - gap / 2, h: height / 2 - gap / 2 }
      ];
    }

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d', { willReadFrequently: false });
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Loads a single image, resolving with the Image object or null on error
    const loadImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'Anonymous'; // Required for canvas
        img.onload = () => {
          resolve(img);
        };
        img.onerror = (err) => {
          console.warn(`Failed to load image: ${url}`, err);
          // Resolve with null on error. This allows Promise.all to succeed even if some images fail,
          // preventing the entire collage from failing if only one image is broken.
          resolve(null);
        };
        img.src = url;
      });
    };

    // Load the first 4 valid images concurrently
    Promise.all(validImageUrls.slice(0, 4).map(loadImage))
      .then(loadedImages => {
        // Filter out any images that failed to load (resolved as null)
        const validImages = loadedImages.filter(img => img !== null);

        if (validImages.length === 0) {
          // If all potentially valid images failed to load, try falling back to the first original URL
          // which might be a placeholder image.
          const firstMissingImage = imageUrls.find(url => isMissingImage(url));
          if (firstMissingImage) {
            resolve(firstMissingImage);
          } else {
            // If no placeholder and all loads failed, reject.
            reject(new Error('All images failed to load and no placeholder found.'));
          }
          return;
        }

        drawCollage(validImages);
      })
      .catch(error => {
        // This catch is primarily for unexpected errors within the Promise.all setup itself,
        // as individual image load errors are handled by resolving to null in `loadImage`.
        console.error("Unexpected error during image loading:", error);
        reject(new Error('An unexpected error occurred while loading images.'));
      });

    /**
     * Draws an image cropped to fill the given dimensions
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {HTMLImageElement} img - Image to draw
     * @param {number} x - X position
     * @param {number} y - Y position
     * @param {number} width - Width
     * @param {number} height - Height
     */
    function drawCroppedImage(ctx, img, x, y, width, height) {
      const aspectRatio = img.width / img.height;
      const targetRatio = width / height;

      let sourceX, sourceY, sourceWidth, sourceHeight;

      if (aspectRatio > targetRatio) {
        // Image aspect ratio is wider than the target area, crop horizontally
        sourceHeight = img.height;
        sourceWidth = sourceHeight * targetRatio;
        sourceX = (img.width - sourceWidth) / 2;
        sourceY = 0;
      } else {
        // Image aspect ratio is taller than or equal to the target area, crop vertically
        sourceWidth = img.width;
        sourceHeight = sourceWidth / targetRatio;
        sourceX = 0;
        sourceY = (img.height - sourceHeight) / 2;
      }

      ctx.drawImage(
        img,
        sourceX, sourceY, sourceWidth, sourceHeight,
        x, y, width, height
      );
    }

    /**
     * Adds a count indicator with a specified shape for single images.
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {number} count - Count to display
     * @param {string} fontFamily - Font family.
     * @param {string} shape - Shape ('circle', 'square', 'pill', 'sunburst').
     * @param {string} colorHex - Hex color for the indicator background (default: '#000000').
     * @param {number} countOverlayOpacity - Opacity for the overlay (default: 0.5).
     */
    function addCountIndicator(ctx, width, height, count, fontFamily, shape = 'circle', colorHex = '#000000', countOverlayOpacity = 0.5) {
      const padding = Math.min(width, height) * 0.04; // Padding from edges
      var baseSize = Math.min(width, height) * 0.25; // Base size relative to canvas size
      let centerX = width - padding - baseSize / 2;
      let centerY = height - padding - baseSize / 2;

      // Variables for text positioning, default to shape center
      let textX = centerX;
      let textY = centerY;
      let fontSizeBaseDimension; // Variable to hold the dimension for font size calculation

      const indicatorFillColor = hexToRgba(colorHex, countOverlayOpacity);
      ctx.fillStyle = indicatorFillColor;
      ctx.strokeStyle = indicatorFillColor;
      ctx.lineWidth = 1;

      // --- Draw Shape Background ---
      ctx.beginPath();
      switch (shape) {
        case 'square':
          var radius = baseSize / 2.5;
          var squareSize = radius * 2;
          ctx.rect(centerX - radius, centerY - radius, squareSize, squareSize);
          fontSizeBaseDimension = radius;
          break;
        case 'pill':
          const pillHeight = baseSize * 0.90;
          const pillWidth = baseSize * 1.3;
          const pillRadius = pillHeight / 2;
          fontSizeBaseDimension = pillRadius * 0.85;
          const pillCenterX = width - padding - pillWidth / 2;
          const pillCenterY = centerY;

          ctx.moveTo(pillCenterX, pillCenterY - pillRadius);
          ctx.arc(pillCenterX, pillCenterY, pillRadius, -Math.PI / 2, Math.PI / 2, false);
          ctx.lineTo(pillCenterX - (pillWidth - pillHeight), pillCenterY + pillRadius);
          ctx.arc(pillCenterX - (pillWidth - pillHeight), pillCenterY, pillRadius, Math.PI / 2, -Math.PI / 2, false);
          ctx.closePath();

          textX = pillCenterX - (pillWidth - pillHeight) / 2;
          textY = pillCenterY;
          break;
        case 'sunburst':
          var radius = baseSize / 2;
          fontSizeBaseDimension = radius * 0.9;
          const numPoints = 8;
          const innerRadius = radius * 0.7;
          const outerRadius = radius * 1.05;
          const angleStep = (Math.PI * 2) / numPoints;

          ctx.moveTo(centerX + outerRadius, centerY);

          for (let i = 0; i < numPoints; i++) {
            const angle = i * angleStep;
            const nextAngle = (i + 1) * angleStep;

            // Outer point
            const outerX = centerX + Math.cos(angle) * outerRadius;
            const outerY = centerY + Math.sin(angle) * outerRadius;

            // Inner point (midway between outer points)
            const innerAngle = angle + angleStep / 2;
            const innerX = centerX + Math.cos(innerAngle) * innerRadius;
            const innerY = centerY + Math.sin(innerAngle) * innerRadius;

            // Next outer point (for control point calculation)
            const nextOuterX = centerX + Math.cos(nextAngle) * outerRadius;
            const nextOuterY = centerY + Math.sin(nextAngle) * outerRadius;

            // Use quadratic curve to the inner point, then to the next outer point
            ctx.quadraticCurveTo(outerX, outerY, innerX, innerY);
            ctx.quadraticCurveTo(nextOuterX, nextOuterY, nextOuterX, nextOuterY); // Curve towards next outer point
          }
          ctx.closePath();
          break;
        case 'circle':
        default:
          var radius = baseSize / 2.3;
          fontSizeBaseDimension = radius;
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          break;
      }
      ctx.fill();

      // Ensure fontSizeBaseDimension has a fallback if no case matched (shouldn't happen with default)
      if (fontSizeBaseDimension === undefined) {
        fontSizeBaseDimension = baseSize / 2.5;
      }

      // --- Draw Count Text ---
      ctx.fillStyle = '#FFFFFF';
      // Adjust font size dynamically based on the number of digits for better fit
      const digits = count.toString().length;
      let fontSizeMultiplier;
      if (digits === 1) {
        fontSizeMultiplier = 0.75;
      } else if (digits === 2) {
        fontSizeMultiplier = 0.68;
      } else if (digits === 3) {
        fontSizeMultiplier = 0.62;
      } else { // Handle 4 or more digits
        fontSizeMultiplier = 0.58;
      }
      // Calculate font size based on the specific dimension determined for the shape
      const fontSize = fontSizeBaseDimension * fontSizeMultiplier;
      ctx.font = `normal ${fontSize}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      // Use textX and textY for positioning, which might differ from centerX/centerY for pill
      // Measure text to calculate precise vertical offset for visual centering
      const metrics = ctx.measureText(count.toString());
      let textHeightOffset = 0;
      // Check for modern metric support for more accurate centering
      if (metrics.actualBoundingBoxAscent && metrics.actualBoundingBoxDescent) {
        // Calculate the distance from the baseline to the visual center of the text
        textHeightOffset = (metrics.actualBoundingBoxAscent - metrics.actualBoundingBoxDescent) / 2;
      }
      ctx.fillText(count.toString(), textX, textY + textHeightOffset);
    }

    /**
     * Adds a "+N" count indicator overlay, typically on the last image slot in a grid.
     * @param {CanvasRenderingContext2D} ctx - Canvas context
     * @param {Object} position - Position object with x, y, w, h properties for the overlay area.
     * @param {number} count - The number to display after the "+".
     * @param {string} fontFamily - Font family.
     * @param {string} colorHex - Hex color for the indicator background (default: '#000000').
     */
    function addGridCountIndicator(ctx, position, count, fontFamily, colorHex = '#000000', countOverlayOpacity = 0.5) {
      // Draw a semi-transparent overlay over the designated area
      ctx.fillStyle = hexToRgba(colorHex, countOverlayOpacity);
      ctx.fillRect(position.x, position.y, position.w, position.h);

      // Draw the "+N" text centered in the overlay
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `normal ${position.h * 0.23}px ${fontFamily}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        `+${count}`,
        position.x + position.w / 2,
        position.y + position.h / 2
      );
    }

    /**
     * Draws the collage using the provided valid images and layout.
     * @param {HTMLImageElement[]} validImages - Array of successfully loaded image objects.
     */
    function drawCollage(validImages) {
      // Draw each loaded image into its designated slot in the layout
      validImages.forEach((img, i) => {
        if (i >= layout.length) return; // Should not happen with current logic, but safe guard
        const position = layout[i];
        drawCroppedImage(ctx, img, position.x, position.y, position.w, position.h);
      });

      // The grid indicator "+N" is shown only on a 4-image layout
      // when the total number of products is 4 or more, AND exceeds the number of images actually drawn.
      const shouldShowGridIndicator = displayCount === 4 && actualTotalCount >= 4 && actualTotalCount > validImages.length;

      if (shouldShowGridIndicator) {
        const remainingCount = actualTotalCount - validImages.length; // Calculate how many are not shown
        // Apply the indicator to the last slot (index 3)
        if (layout && layout.length > 3) { // Ensure layout[3] exists
          addGridCountIndicator(ctx, layout[3], remainingCount, fontFamily, gridIndicatorColorHex, countOverlayOpacity);
        }
      }
      // Note: The circle indicator is *never* used for collage layouts (displayCount > 1).

      // Resolve the promise with the generated collage image data URL
      resolve(canvas.toDataURL('image/jpeg', 0.9)); // Use JPEG format with quality 0.9
    }
  });
}

/**
 * Converts a hex color string to an RGBA string.
 * @param {string} hex - The hex color string (e.g., '#RRGGBB' or '#RGB').
 * @param {number} alpha - The alpha value (0 to 1).
 * @returns {string} - The RGBA color string (e.g., 'rgba(r, g, b, alpha)').
 */
function hexToRgba(hex, alpha = 1) {
  hex = hex.replace('#', '');
  let r, g, b;

  if (hex.length === 3) {
    r = parseInt(hex.substring(0, 1).repeat(2), 16);
    g = parseInt(hex.substring(1, 2).repeat(2), 16);
    b = parseInt(hex.substring(2, 3).repeat(2), 16);
  } else if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);
  } else {
    // Default to black if hex is invalid
    console.warn(`Invalid hex color: ${hex}. Defaulting to black.`);
    return `rgba(0, 0, 0, ${alpha})`;
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


/**
 * Simple seeded pseudo-random number generator (Mulberry32).
 * @param {number} seed - The initial seed.
 * @returns {function(): number} - A function that returns a random float between 0 (inclusive) and 1 (exclusive).
 */
function mulberry32(seed) {
  return function() {
    var t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}


/**
 * Process a single container by creating and applying a collage
 * @param {HTMLElement} container - Container element with collage data attributes
 * @param {object} collageOptions - Options passed to `createCollage` (width, height, gap).
 */
function processContainer(container, collageOptions = {}) {
  const categoryId = container.id.replace('category-collage-', '');

  // --- Read configuration from data attributes ---
  const imageUrlsAttr = container.getAttribute('data-image-urls');
  const productCount = parseInt(container.getAttribute('data-product-count') || '0', 10);
  const fontFamily = container.getAttribute('data-font-family') || 'sans-serif';
  const countDisplay = container.getAttribute('data-count-display') || 'circle'
  const countOverlayOpacity = container.getAttribute('data-count-overlay-opacity') || 0.5;
  const showCount = countDisplay !== 'text' && countDisplay !== 'none';
  const imageStyle = container.getAttribute('data-image-style') || 'single';
  const indicatorColorHex = container.getAttribute('data-indicator-color') || '#000000';
  const gridIndicatorColorHex = container.getAttribute('data-grid-indicator-color') || '#000000';

  if (!imageUrlsAttr) {
    console.warn(`No image URLs found for container: ${categoryId}`);
    return;
  }

  let imageUrls;
  try {
    imageUrls = JSON.parse(imageUrlsAttr);
  } catch (e) {
    console.error(`Failed to parse image URLs for container ${categoryId}:`, e);
    return;
  }

  if (!imageUrls || !imageUrls.length) {
    console.warn(`Empty image URL list for container: ${categoryId}`);
    return;
  }

  // Determine context *before* potentially modifying imageUrls based on random styles
  const context = (imageStyle === 'collage' || imageStyle === 'collage_random') ? 'collage' : 'single';

  // --- Handle Random Selection Styles ---
  if (imageStyle === 'random_product' && imageUrls.length > 0) {
    // Select one random URL
    const randomIndex = Math.floor(Math.random() * imageUrls.length);
    imageUrls = [imageUrls[randomIndex]]; // Reassign to an array with only the selected URL
  }
  else if (imageStyle === 'collage_random' && imageUrls.length > 1) { // Only shuffle if more than 1 image
    // Generate a seed based on time quantized to 5-minute intervals
    const fiveMinutesInMs = 5 * 60 * 1000;
    const timeSeed = Math.floor(Date.now() / fiveMinutesInMs);
    const seededRandom = mulberry32(timeSeed);

    // Fisher-Yates (Knuth) Shuffle using the seeded generator
    for (let i = imageUrls.length - 1; i > 0; i--) {
      const j = Math.floor(seededRandom() * (i + 1)); // Use seededRandom()
      [imageUrls[i], imageUrls[j]] = [imageUrls[j], imageUrls[i]];
    }
    imageUrls = imageUrls.slice(0, 4);
  }
  // Note: For 'collage' style, we still rely on createCollage's internal logic to take the first 4.
  // For 'first_product', we rely on createCollage's logic to handle the single URL.

  const finalCollageOptions = {
    width: 800,
    height: 800,
    gap: 1,
    ...collageOptions
  };

  createCollage(
    imageUrls,
    finalCollageOptions.width,
    finalCollageOptions.height,
    finalCollageOptions.gap,
    productCount,
    fontFamily,
    showCount,
    context,
    countDisplay,
    indicatorColorHex,
    gridIndicatorColorHex,
    countOverlayOpacity
  )
    .then(collageUrl => {
      const img = container.querySelector('img');
      if (img) {
        // --- Update the image element smoothly ---
        // 1. Add loading state and clean up potential lazy loading attributes.
        img.classList.add('collage-image', 'loading');
        img.classList.remove('lazyload'); // Remove lazysizes class if present
        img.removeAttribute('data-srcset'); // Remove srcset if present

        // 2. Use requestAnimationFrame to ensure the 'loading' class is applied and rendered
        //    before we potentially trigger a reflow by setting the src.
        requestAnimationFrame(() => {
          // 3. Set up load/error handlers *before* assigning the new src.
          img.onload = () => {
            // 4. On successful load, remove the loading class. Use rAF again for a potentially smoother visual transition.
            requestAnimationFrame(() => {
              img.classList.remove('loading');
            });
            // Clean up handlers to prevent memory leaks
            img.onload = null;
            img.onerror = null;
          };
          img.onerror = () => {
            console.error(`Failed to load generated collage data URL for ${categoryId}`);
            img.classList.remove('loading');
            img.onload = null;
            img.onerror = null;
          };

          // 5. Explicitly mark as loaded for lazysizes compatibility *before* setting src.
          //    This prevents lazysizes from potentially interfering after we set the src.
          img.classList.add('lazyloaded');

          // 6. Set the new image source (the generated data URL), triggering the browser load.
          img.src = collageUrl;
        });
      } else {
        console.warn(`No img element found within container: ${categoryId}`);
      }
    })
    .catch(error => {
      console.error(`Failed to create or apply collage for category ID ${categoryId}:`, error);
    });
}

/**
 * Sets up lazy loading for category collages using Intersection Observer
 * @param {object} options - Configuration options.
 * @param {object} [options.collage={}] - Options to pass to `createCollage` (e.g., width, height, gap).
 * @param {object} [options.observer={}] - Options for the `IntersectionObserver` (e.g., rootMargin, threshold).
 */
function setupCategoryCollages(options = {}) {
  // Destructure options with defaults
  const { collage: collageOptions = {}, observer: observerOptions = {} } = options;

  const finalObserverOptions = {
    rootMargin: '200px 0px', // Start loading when the element is 200px away from the viewport
    threshold: 0.01,         // Trigger when at least 1% of the element is visible
    ...observerOptions
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const container = entry.target;
        // Process the container to generate and apply the collage
        // Pass only the collage-specific options down
        processContainer(container, collageOptions);
        // Once processed, stop observing this container to prevent reprocessing
        observer.unobserve(container);
      }
    });
  }, finalObserverOptions);

  // Select all potential category collage containers on the page
  const categoryContainers = document.querySelectorAll('[id^="category-collage-"]');

  categoryContainers.forEach(container => {
    observer.observe(container);
  });
}
