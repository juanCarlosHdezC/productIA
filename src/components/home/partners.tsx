import React from "react";

const Partners = () => {
  return (
    <section className="w-full border-t border-b py-12 md:py-16 bg-muted/40">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-xl font-medium tracking-tight md:text-2xl">
              Confiado por miles de tiendas online y marcas
            </h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 lg:gap-16">
            <div className="text-2xl font-semibold text-muted-foreground">
              Shopify
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">
              WooCommerce
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">
              PrestaShop
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">
              Magento
            </div>
            <div className="text-2xl font-semibold text-muted-foreground">
              BigCommerce
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Partners;
