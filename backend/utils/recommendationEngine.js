import natural from "natural";

const TfIdf = natural.TfIdf;
const tokenizer = new natural.WordTokenizer();

export function getSimilarProducts(targetProduct, allProducts, limit = 4) {
    const tfidf = new TfIdf();

    // 1. Add documents to TF-IDF
    // We combine key fields to create a "content string" for each product
    // We duplicate brand and category to give them higher weight in the TF-IDF scoring for E-commerce relevance
    const documents = allProducts.map((p) => {
        const categoryName = p.category?.name || "";
        const content = `${p.name} ${p.description} ${p.brand} ${p.brand} ${p.brand} ${categoryName} ${categoryName} ${categoryName}`;
        tfidf.addDocument(content);
        return { id: p._id.toString(), content };
    });

    // 2. Find index of target product
    const targetId = targetProduct._id.toString();
    const targetIndex = documents.findIndex((doc) => doc.id === targetId);

    // if (targetIndex === -1) return []; // Removed to support 'virtual' targets (User Profiles)

    // 3. Calculate similarities
    // We treat the target product's content as a query and score all other documents against it.

    const otherProducts = allProducts.filter(p => p._id.toString() !== targetId);
    const newTfIdf = new TfIdf();

    otherProducts.forEach(p => {
        const categoryName = p.category?.name || "";
        // Weighted content string
        const content = `${p.name} ${p.description} ${p.brand} ${p.brand} ${p.brand} ${categoryName} ${categoryName} ${categoryName}`;
        newTfIdf.addDocument(content);
    });

    const targetCategory = targetProduct.category?.name || (targetProduct.category?.name ? targetProduct.category.name : "");
    const targetContent = `${targetProduct.name} ${targetProduct.description} ${targetProduct.brand} ${targetProduct.brand} ${targetProduct.brand} ${targetCategory} ${targetCategory} ${targetCategory}`;

    // Get scores for the target content against all other docs
    // tfidf.tfidfs returns an array of numbers (scores) for each document
    const nlpScores = newTfIdf.tfidfs(targetContent);

    // If target has a price, we incorporate price similarity
    const targetPrice = targetProduct.price || 0;

    const scoredProducts = otherProducts.map((p, index) => {
        let finalScore = nlpScores[index];

        // Advanced: Price Proximity Scoring
        // If the product has a price and we know the target price, penalize items that are massively different in price
        if (targetPrice > 0 && p.price > 0) {
            const priceDiff = Math.abs(targetPrice - p.price);
            const priceRatio = priceDiff / targetPrice;

            // If the price is more than 50% different, start applying a penalty
            if (priceRatio > 0.5) {
                // Penalty scales with the difference. A 200% diff will halve the NLP score.
                const penalty = Math.max(0.5, 1 - (priceRatio * 0.2));
                finalScore *= penalty;
            }
        }

        return {
            product: p,
            score: finalScore
        };
    });

    // 4. Sort and Limit
    scoredProducts.sort((a, b) => b.score - a.score);

    return scoredProducts.slice(0, limit).map(item => item.product);
}
