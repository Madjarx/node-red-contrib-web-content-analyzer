module.exports = function(RED) {
    const axios = require('axios');
    const cheerio = require('cheerio');
    const url = require('url');

    function PageFinderNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const visitedLinks = new Set();
        const queue = [];

        async function crawl() {
            node.status({fill:"blue", shape:"dot", text:"processing"});
            while (queue.length > 0) {
                const pageUrl = queue.shift();

                if (visitedLinks.has(pageUrl)) continue;
                visitedLinks.add(pageUrl);
                console.log(`Visited: ${pageUrl}`);
                node.status({fill:"green", shape:"dot", text:`visited ${visitedLinks.size} pages`});

                let html;
                try {
                    const response = await axios.get(pageUrl);
                    html = response.data;
                } catch (error) {
                    node.error(`Failed to fetch ${pageUrl}: ${error}`);
                    node.status({fill:"red", shape:"ring", text:`error: ${error.message}`});
                    continue;
                }

                const $ = cheerio.load(html);
                const links = $('a');

                links.each((i, link) => {
                    const href = $(link).attr('href');
                    const absoluteUrl = url.resolve(pageUrl, href);

                    if (absoluteUrl !== pageUrl && absoluteUrl.startsWith(pageUrl)) {
                        if (!visitedLinks.has(absoluteUrl) && !queue.includes(absoluteUrl)) {
                            queue.push(absoluteUrl);

                            const output = RED.util.cloneMessage({});
                            RED.util.setMessageProperty(output, config.outputProperty, absoluteUrl);
                            node.send(output);
                        }
                    }
                });
            }
        }

        node.on('input', function(msg) {
            const pageUrl = RED.util.evaluateNodeProperty(config.url, config.urlType, this, msg);
            if (!visitedLinks.has(pageUrl) && !queue.includes(pageUrl)) {
                queue.push(pageUrl);
            }
            crawl();
        });
    }

    RED.nodes.registerType('page-finder', PageFinderNode);
}