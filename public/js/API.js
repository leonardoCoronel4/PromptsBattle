const api_base_url = 'https://image.pollinations.ai/prompt/';

let preview_heigth = '?height=1280';
let preview_width = '&width=720';

let definitive_heigth = '?height=1920';
let definitive_width = '&width=1080';

let nologo = '&nologo=true';
let seed = '&seed=';

let definitive = true;

function generatePromptImage(prompt, seedNumber, definitive) {
    let api_url;
    definitive ? api_url = api_base_url + encodeURIComponent(prompt) + definitive_height + definitive_width + nologo + seed + seedNumber :
    api_url = api_base_url + encodeURIComponent(prompt) + preview_heigth + preview_width + nologo + seed + seedNumber;
    return api_url;
}