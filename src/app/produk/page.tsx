'use client';
import * as React from "react";
import { ProductCard } from "@/components/custom/ProductCard";

export default function ProductPage() {
  const products = [
    {
      image: "https://via.placeholder.com/312.png?text=Produk+1",
      name: "Golden Fill",
      price: "60.000",
    },
    {
      image: "https://via.placeholder.com/312.png?text=Produk+2",
      name: "Plastik Kemasan 1L",
      price: "8.500",
    },
    {
      image: "https://via.placeholder.com/312.png?text=Produk+3",
      name: "Mika Roti",
      price: "10.000",
    },
  ];

  const handleAddToCart = (product: any) => {
    alert(`${product.name} ditambahkan ke keranjang!`);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-wrap gap-6 justify-center p-6">
      {products.map((p, i) => (
        <ProductCard
          key={i}
          image={p.image}
          name={p.name}
          price={p.price}
          onAddToCart={() => handleAddToCart(p)}
        />
      ))}
    </div>
  );
}
