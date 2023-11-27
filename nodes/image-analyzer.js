module.exports = function(RED) {
    const axios = require('axios');
    const cheerio = require('cheerio');

    function ImageAnalyzerNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var previousUrl = null;
        node.on('input', async function(msg) {
            try {
                node.status({fill:"blue",shape:"dot",text:"processing"});
                let url;
                switch (config.urlType) {
                    case 'str':
                        url = config.url;
                        break;
                    case 'msg':
                        url = RED.util.getMessageProperty(msg, config.url);
                        break;
                    case 'flow':
                        url = node.context().flow.get(config.url);
                        break;
                    case 'global':
                        url = node.context().global.get(config.url);
                        break;
                    default:
                        throw new Error('Invalid URL type');
                }
                if (url === previousUrl) {
                    return;
                }
                previousUrl = url;
                let keywords = config.keywords.toLowerCase().split(',').map(keyword => keyword.trim());
                const response = await axios.get(url);
                const $ = cheerio.load(response.data);
                let found = false;
                console.log(keywords, url)
                $('img').each((i, img) => {
                    const title = $(img).attr('title')?.toLowerCase();
                    const alt = $(img).attr('alt')?.toLowerCase();
                    const metaTitle = $(img).data('meta-title')?.toLowerCase();
                    const metaDescription = $(img).data('meta-description')?.toLowerCase();
                    keywords.forEach(keyword => {
                        if ((title && title.includes(keyword)) || 
                            (alt && alt.includes(keyword)) || 
                            (metaTitle && metaTitle.includes(keyword)) || 
                            (metaDescription && metaDescription.includes(keyword))) {
                            found = true;
                            const output = {
                                keyword: keyword,
                                imageSource: $(img).attr('src'),
                                imageLocation: url,
                                matched: [title, alt, metaTitle, metaDescription].filter(attr => attr && attr.includes(keyword))
                            };
                            node.send({ payload: output });
                        }
                    });
                });
                if (!found) {
                    node.send({ payload: { message: `Nothing was found on link: ${url}` } });
                }
                node.status({fill:"green",shape:"dot",text:"done"});
            } catch (error) {
                node.error(error);
                node.status({fill:"red",shape:"ring",text:"error"});
            }
        });
    }
    RED.nodes.registerType("image-analyzer", ImageAnalyzerNode, {
        defaults: {
            url: {value: "", required: true},
            urlType: {value: "str", required: true},
            keywords: {value: "", required: true}
        }
    });
}