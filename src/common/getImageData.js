function getImageData(props, devicePixelRatio = 1) {
  return {
    height: props.height || props.dimensions && props.dimensions.height,
    path: props.path,
    devicePixelRatio,
    width: props.width || props.dimensions && props.dimensions.width,
  };
}

module.exports = getImageData;
