class ClaudeSmartSearch {
  constructor() {
    this.synonyms = {
      laptop: [
        "ordinateur portable",
        "pc portable",
        "notebook",
        "macbook",
        "computer",
      ],
      phone: ["téléphone", "smartphone", "mobile", "iphone", "android"],
      gaming: ["jeu", "gamer", "gaming", "jeux vidéo", "console"],
      cheap: ["pas cher", "abordable", "économique", "budget", "bon marché"],
      expensive: ["cher", "premium", "haut de gamme", "luxe"],
      fast: ["rapide", "performant", "puissant", "high-performance"],
      small: ["petit", "compact", "mini", "portable"],
      large: ["grand", "large", "xl", "big"],
    };

    this.priceRanges = {
      "sous 100": { max: 100 },
      "sous 200": { max: 200 },
      "sous 500": { max: 500 },
      "sous 1000": { max: 1000 },
      "plus de 1000": { min: 1000 },
      "entre 100 et 500": { min: 100, max: 500 },
      "entre 500 et 1000": { min: 500, max: 1000 },
    };

    this.intents = {
      comparison: /compar|meilleur|vs|versus|différence/i,
      recommendation: /recommand|conseil|suggér|aide|choix/i,
      budget: /budget|prix|coût|abordable|cher/i,
      specs: /caractéristique|spec|performance|qualité/i,
      availability: /disponib|stock|livraison|délai/i,
    };
  }

  parseNaturalQuery(query) {
    const analysis = {
      originalQuery: query,
      intent: this.detectIntent(query),
      extractedTerms: this.extractSearchTerms(query),
      priceFilter: this.extractPriceRange(query),
      platformPreference: this.extractPlatformPreference(query),
      urgency: this.detectUrgency(query),
      enhancedQuery: "",
    };

    analysis.enhancedQuery = this.buildEnhancedQuery(analysis);

    return analysis;
  }

  detectIntent(query) {
    const intents = [];

    for (const [intent, pattern] of Object.entries(this.intents)) {
      if (pattern.test(query)) {
        intents.push(intent);
      }
    }

    return intents.length > 0 ? intents : ["search"];
  }

  extractSearchTerms(query) {
    let terms = new Set();
    const queryLower = query.toLowerCase();

    Object.entries(this.synonyms).forEach(([key, synonymList]) => {
      synonymList.forEach((synonym) => {
        if (queryLower.includes(synonym.toLowerCase())) {
          terms.add(key);
          terms.add(synonym);
        }
      });
    });

    const words = query
      .split(/\s+/)
      .filter(
        (word) =>
          word.length > 2 && !this.isStopWord(word) && !this.isPriceWord(word),
      );

    words.forEach((word) => terms.add(word));

    return Array.from(terms);
  }

  extractPriceRange(query) {
    const queryLower = query.toLowerCase();

    for (const [range, filter] of Object.entries(this.priceRanges)) {
      if (queryLower.includes(range)) {
        return filter;
      }
    }

    const priceMatch = query.match(/(\d+)[\s€$]*(?:à|-)[\s€$]*(\d+)/);
    if (priceMatch) {
      return {
        min: parseInt(priceMatch[1]),
        max: parseInt(priceMatch[2]),
      };
    }

    const maxMatch = query.match(/(?:sous|maximum|max|jusqu'à)[\s€$]*(\d+)/i);
    if (maxMatch) {
      return { max: parseInt(maxMatch[1]) };
    }

    const minMatch = query.match(
      /(?:plus de|minimum|min|à partir de)[\s€$]*(\d+)/i,
    );
    if (minMatch) {
      return { min: parseInt(minMatch[1]) };
    }

    return null;
  }

  extractPlatformPreference(query) {
    const platforms = ["amazon", "ebay", "walmart", "best buy", "target"];
    const queryLower = query.toLowerCase();

    return platforms.find((platform) => queryLower.includes(platform)) || null;
  }

  detectUrgency(query) {
    const urgentWords = /urgent|maintenant|rapidement|vite|asap|immédiat/i;
    const relaxedWords = /quand|eventual|futur|plus tard|pas pressé/i;

    if (urgentWords.test(query)) return "high";
    if (relaxedWords.test(query)) return "low";
    return "medium";
  }

  buildEnhancedQuery(analysis) {
    let query = analysis.extractedTerms.join(" ");

    if (analysis.priceFilter) {
      if (analysis.priceFilter.max) {
        query += ` under ${analysis.priceFilter.max}`;
      }
      if (analysis.priceFilter.min) {
        query += ` over ${analysis.priceFilter.min}`;
      }
    }

    return query.trim();
  }

  isStopWord(word) {
    const stopWords = [
      "le",
      "la",
      "les",
      "un",
      "une",
      "des",
      "de",
      "du",
      "et",
      "ou",
      "pour",
      "avec",
      "dans",
      "sur",
      "sous",
      "the",
      "a",
      "an",
      "and",
      "or",
      "for",
      "with",
      "in",
      "on",
      "under",
    ];
    return stopWords.includes(word.toLowerCase());
  }

  isPriceWord(word) {
    const priceWords = [
      "prix",
      "coût",
      "euro",
      "dollar",
      "cheap",
      "expensive",
      "cher",
      "abordable",
    ];
    return priceWords.includes(word.toLowerCase());
  }

  generateSmartSuggestions(query, searchResults) {
    const analysis = this.parseNaturalQuery(query);
    const suggestions = [];

    if (analysis.intent.includes("comparison") && searchResults.length > 1) {
      suggestions.push({
        type: "comparison",
        title: "Comparaison des prix",
        action: "compare_prices",
        description: "Comparer les prix entre plateformes",
      });
    }

    if (analysis.intent.includes("budget") && analysis.priceFilter) {
      const affordableResults = searchResults.filter((result) => {
        if (analysis.priceFilter.max && result.price > analysis.priceFilter.max)
          return false;
        if (analysis.priceFilter.min && result.price < analysis.priceFilter.min)
          return false;
        return true;
      });

      if (affordableResults.length > 0) {
        suggestions.push({
          type: "budget",
          title: "Produits dans votre budget",
          count: affordableResults.length,
          action: "filter_budget",
        });
      }
    }

    if (analysis.urgency === "high") {
      const availableNow = searchResults.filter(
        (result) =>
          result.platform === "Amazon" || result.platform === "Best Buy",
      );

      if (availableNow.length > 0) {
        suggestions.push({
          type: "urgency",
          title: "Livraison rapide disponible",
          count: availableNow.length,
          action: "filter_fast_delivery",
        });
      }
    }

    return {
      analysis,
      suggestions,
      enhancedResults: this.rankResults(searchResults, analysis),
    };
  }

  rankResults(results, analysis) {
    return results
      .map((result) => {
        let score = 1.0;

        if (analysis.priceFilter) {
          if (
            analysis.priceFilter.max &&
            result.price <= analysis.priceFilter.max
          ) {
            score += 0.3;
          }
          if (
            analysis.priceFilter.min &&
            result.price >= analysis.priceFilter.min
          ) {
            score += 0.2;
          }
        }

        if (
          analysis.platformPreference &&
          result.platform.toLowerCase() === analysis.platformPreference
        ) {
          score += 0.4;
        }

        if (
          analysis.urgency === "high" &&
          (result.platform === "Amazon" || result.platform === "Best Buy")
        ) {
          score += 0.2;
        }

        analysis.extractedTerms.forEach((term) => {
          if (result.title.toLowerCase().includes(term.toLowerCase())) {
            score += 0.1;
          }
        });

        return {
          ...result,
          claudeScore: parseFloat(score.toFixed(2)),
          reasoning: this.explainScore(score, analysis, result),
        };
      })
      .sort((a, b) => b.claudeScore - a.claudeScore);
  }

  explainScore(score, analysis, result) {
    const reasons = [];

    if (
      analysis.priceFilter &&
      result.price <= (analysis.priceFilter.max || Infinity)
    ) {
      reasons.push("Respecte le budget");
    }

    if (
      analysis.platformPreference &&
      result.platform.toLowerCase() === analysis.platformPreference
    ) {
      reasons.push("Plateforme préférée");
    }

    if (
      analysis.urgency === "high" &&
      (result.platform === "Amazon" || result.platform === "Best Buy")
    ) {
      reasons.push("Livraison rapide");
    }

    return reasons.join(", ") || "Correspondance générale";
  }
}

module.exports = new ClaudeSmartSearch();
