import * as React from "react";
import { Button } from "@/components/ui/button";

export interface ProductCardProps {
  image?: string;
  name: string;
  price: string | number;
  onAddToCart?: () => void;
  className?: string;
  imageAlt?: string;
}

export function ProductCard({
  image,
  name,
  price,
  onAddToCart,
  className = "",
  imageAlt = "Product Image",
}: ProductCardProps) {
  return (
    <div
      className={`w-[312px] h-[401px] bg-white rounded-2xl shadow-sm flex flex-col ${className}`}
    >
      {/* Image (fixed 312x312) */}
      <div className="w-full h-[312px] bg-gray-200 rounded-t-xl overflow-hidden flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={imageAlt}
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <div className="text-gray-400 text-sm">No Image</div>
        )}
      </div>

      {/* Content area under image */}
      <div className="mt-3 p-3 flex-0 w-full">
        {/* Row: name (left) and price (right) */}
        <div className="w-full flex items-center justify-between">
          <p className="text-sm font-semibold text-black truncate max-w-[70%]">
            {name}
          </p>
          <p className="text-sm font-semibold text-black">Rp. {price}</p>
        </div>

        {/* Button, placed under the name and aligned to left */}
        <div className="mt-3">
          <Button
            onClick={onAddToCart}
            className="mt-2 bg-[#0a452f] hover:bg-[#0b533a] text-white rounded-full text-sm flex items-center justify-center transition"
          >
            + Keranjang
          </Button>
        </div>
      </div>
    </div>
  );
}
