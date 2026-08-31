import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { products } from "../data/products";

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">THE NEW DROP</p>
          <h1>Style that feels<br /><em>effortless.</em></h1>
          <p>Curated streetwear and everyday essentials designed for your rotation.</p>
          <Link to="/shop" className="btn btn-dark">Shop collection</Link>
        </div>
        <img src="/products/product-4.jpg" alt="New fashion collection" />
      </section>

      <section className="section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">CURATED FOR YOU</p>
            <h2>Trending now</h2>
          </div>
          <Link to="/shop" className="text-link">View all →</Link>
        </div>
        <div className="product-grid">
          {products.slice(0, 4).map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      </section>

      <section className="promo">
        <div>
          <p className="eyebrow">THRIFT-FLIP EDIT</p>
          <h2>Good clothes.<br />Better prices.</h2>
          <p>Find relaxed fits, vintage-inspired pieces and versatile layers.</p>
          <Link to="/shop" className="btn btn-light">Explore styles</Link>
        </div>
      </section>
    </>
  );
}