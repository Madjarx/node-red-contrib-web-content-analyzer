module.exports = function(RED) {
    const axios = require('axios');
    const cheerio = require('cheerio');

    function TextAnalyzerNode(config) {
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
                let outputs = [];
                $('p, span, h1, h2, h3, h4, h5, h6').each((i, element) => {
                    const text = $(element).text().toLowerCase();
                    keywords.forEach(keyword => {
                        if (text && text.includes(keyword)) {
                            found = true;
                            const output = {
                                keyword: keyword,
                                textLocation: url,
                                matched: text
                            };
                            outputs.push({ payload: output });
                        }
                    });
                });
                outputs.forEach(output => node.send(output));
                if (!found) {
                    node.send({ payload: { message: `Keyword not found on link: ${url}` } });
                }
                node.status({fill:"green",shape:"dot",text:"done"});
            } catch (error) {
                node.error(error);
                node.status({fill:"red",shape:"ring",text:"error"});
            }
        });
    }
    RED.nodes.registerType("text-analyzer", TextAnalyzerNode, {
        defaults: {
            url: {value: "", required: true},
            urlType: {value: "str", required: true},
            keywords: {value: "", required: true}
        }
    });
}