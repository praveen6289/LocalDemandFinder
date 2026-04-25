const { runProviderTask } = require("../shared/providerRunner");

const mockProducts = [
  {
    productName: "Reusable Lunch Bag",
    category: "Kitchen",
    price: 449,
    rating: 4.4,
    reviewCount: 420,
    sellerCount: 9,
    location: "Pune",
    marketplaceName: "MockKart"
  },
  {
    productName: "Reusable Lunch Bag Premium",
    category: "Kitchen",
    price: 519,
    rating: 4.2,
    reviewCount: 180,
    sellerCount: 5,
    location: "Pune",
    marketplaceName: "SellerSquare"
  },
  {
    productName: "Organic Jaggery Cubes",
    category: "Grocery",
    price: 199,
    rating: 4.6,
    reviewCount: 385,
    sellerCount: 8,
    location: "Bengaluru",
    marketplaceName: "MockKart"
  },
  {
    productName: "Organic Jaggery Cubes Family Pack",
    category: "Grocery",
    price: 239,
    rating: 4.5,
    reviewCount: 240,
    sellerCount: 6,
    location: "Bengaluru",
    marketplaceName: "FreshShelf"
  },
  {
    productName: "Copper Water Bottle",
    category: "Home",
    price: 699,
    rating: 4.1,
    reviewCount: 760,
    sellerCount: 24,
    location: "Mumbai",
    marketplaceName: "MockKart"
  },
  {
    productName: "Bluetooth Speaker",
    category: "Electronics",
    price: 1699,
    rating: 4.3,
    reviewCount: 930,
    sellerCount: 56,
    location: "Delhi",
    marketplaceName: "ElectroHub"
  },
  {
    productName: "Yoga Resistance Band",
    category: "Fitness",
    price: 399,
    rating: 4.0,
    reviewCount: 470,
    sellerCount: 19,
    location: "Hyderabad",
    marketplaceName: "FitNest"
  },
  {
    productName: "LED Strip Light",
    category: "Home Decor",
    price: 599,
    rating: 4.1,
    reviewCount: 540,
    sellerCount: 31,
    location: "Chennai",
    marketplaceName: "HomeGlow"
  },
  {
    productName: "Handmade Soy Candle",
    category: "Home Decor",
    price: 349,
    rating: 4.7,
    reviewCount: 290,
    sellerCount: 13,
    location: "Jaipur",
    marketplaceName: "ArtisanBay"
  },
  {
    productName: "Portable Blender Bottle",
    category: "Kitchen",
    price: 899,
    rating: 4.2,
    reviewCount: 215,
    sellerCount: 11,
    location: "Pune",
    marketplaceName: "SellerSquare"
  }
];

async function searchMarketplace({ keyword, category, location }) {
  return runProviderTask("marketplace", async (metadata) => {
    const normalizedKeyword = (keyword || "").trim().toLowerCase();
    const normalizedCategory = (category || "").trim().toLowerCase();
    const normalizedLocation = (location || "").trim().toLowerCase();

    const items = mockProducts.filter((product) => {
      const matchesKeyword = normalizedKeyword
        ? product.productName.toLowerCase().includes(normalizedKeyword)
        : true;
      const matchesCategory = normalizedCategory
        ? product.category.toLowerCase() === normalizedCategory
        : true;
      const matchesLocation = normalizedLocation
        ? product.location.toLowerCase() === normalizedLocation
        : true;

      return matchesKeyword && matchesCategory && matchesLocation;
    });

    return {
      source: "marketplace-mock",
      providerType: "mock",
      keyword,
      category,
      location,
      items,
      requestMeta: metadata
    };
  });
}

module.exports = {
  searchMarketplace
};
