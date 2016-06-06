

export const yt_regex = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
export function youtube_parser (url) {
  var match = url.match(yt_regex);
  return match && match[7].length === 11 ? match[7] : url;
}

/*eslint-disable max-len */
export const vimeo_regex = /https?:\/\/(?:www\.|player\.)?vimeo.com\/(?:channels\/(?:\w+\/)?|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/;
/*eslint-enable max-len */
export function vimeo_parser (url) {
  var match = url.match(vimeo_regex);
  return match && typeof match[3] === 'string' ? match[3] : url;
}

export const vine_regex = /^http(?:s?):\/\/(?:www\.)?vine\.co\/v\/([a-zA-Z0-9]{1,13}).*/;
export function vine_parser (url) {
  var match = url.match(vine_regex);
  return match && match[1].length === 11 ? match[1] : url;
}

export const videoUrlParser = (videoUrl) => {
  if (videoUrl.match(yt_regex)) {
    return {service: 'youtube', videoId: youtube_parser(videoUrl)};
  }
  if (videoUrl.match(vimeo_regex)) {
    return {service: 'vimeo', videoId: vimeo_parser(videoUrl)};
  }
}
