export const StringTagFormatter = (str: string | undefined) => {
    if (!str) return undefined;
    let out = str
      .replace(/\*b\*(.*?)\*b\*/g, '<b>$1</b>')
      .replace(/\*i\*(.*?)\*i\*/g, '<i>$1</i>')
      .replace(/\*u\*(.*?)\*u\*/g, '<u>$1</u>')
      .replace(/\*br\*/g, '<br/>')
      .replace(/\*a link=(.*?)\*(.*?)\*a\*/g, '<a href="$1" target="_blank">$2</a>');
    out = out.replace(/\r\n|\r|\n/g, '<br/>');
    return out;
};

export const TagStringFormatter = (str: string | undefined) => {
    if (!str) return undefined;
    const out = str
      .replace(/<b>(.*?)<\/b>/g, '*b*$1*b*')
      .replace(/<i>(.*?)<\/i>/g, '*i*$1*i*')
      .replace(/<u>(.*?)<\/u>/g, '*u*$1*u*')
      .replace(/<a\s+href="(.*?)"\s+target="_blank">(.*?)<\/a>/g, '*a link=$1*$2*a*')
      .replace(/<br\s*\/?>/g, '\n');
    return out;
};