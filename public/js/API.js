const api_base_url = "https://image.pollinations.ai/prompt/";

let preview_height = "?height=1280";
let preview_width = "&width=720";

let definitive_height = "?height=1920";
let definitive_width = "&width=1080";

let nologo = "&nologo=true";
let seed = "&seed=";

let definitive = true;

let sinDiacriticos = (function(){
    let de = 'ÁÃÀÄÂÉËÈÊÍÏÌÎÓÖÒÔÚÜÙÛÑÇáãàäâéëèêíïìîóöòôúüùûñç',
         a = 'AAAAAEEEEIIIIOOOOUUUUNCaaaaaeeeeiiiioooouuuunc',
        re = new RegExp('['+de+']' , 'ug');

    return texto =>
        texto.replace(
            re, 
            match => a.charAt(de.indexOf(match))
        );
})();

export function generatePromptImage(prompt, seedNumber, definitive) {
    let api_url;
    let promptClean = sinDiacriticos(prompt);
    definitive
        ? (api_url =
              api_base_url +
              encodeURIComponent(promptClean) +
              definitive_height +
              definitive_width +
              nologo +
              seed +
              seedNumber)
        : (api_url =
              api_base_url +
              encodeURIComponent(promptClean) +
              preview_height +
              preview_width +
              nologo +
              seed +
              seedNumber);
    return api_url;
}
