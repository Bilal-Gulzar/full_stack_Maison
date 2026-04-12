import type { StructureResolver } from "sanity/structure";

/**
 * Custom Studio sidebar — orders are grouped by status so you can
 * jump straight to "Pending" or "Shipped" without scrolling a flat list.
 * Every other document type keeps its default list.
 */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("Content")
    .items([
      S.listItem()
        .title("Orders")
        .icon(() => "🧾")
        .child(
          S.list()
            .title("Orders")
            .items([
              S.listItem()
                .title("🆕  Pending")
                .child(
                  S.documentList()
                    .title("Pending orders")
                    .filter('_type == "order" && status == "pending"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),
              S.listItem()
                .title("✔️  Confirmed")
                .child(
                  S.documentList()
                    .title("Confirmed orders")
                    .filter('_type == "order" && status == "confirmed"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),
              S.listItem()
                .title("⚙️  Processing")
                .child(
                  S.documentList()
                    .title("Processing orders")
                    .filter('_type == "order" && status == "processing"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),
              S.listItem()
                .title("📦  Shipped")
                .child(
                  S.documentList()
                    .title("Shipped orders")
                    .filter('_type == "order" && status == "shipped"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),
              S.listItem()
                .title("✅  Delivered")
                .child(
                  S.documentList()
                    .title("Delivered orders")
                    .filter('_type == "order" && status == "delivered"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),
              S.listItem()
                .title("❌  Cancelled")
                .child(
                  S.documentList()
                    .title("Cancelled orders")
                    .filter('_type == "order" && status == "cancelled"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),
              S.divider(),
              S.listItem()
                .title("📋  All orders (newest first)")
                .child(
                  S.documentList()
                    .title("All orders")
                    .filter('_type == "order"')
                    .defaultOrdering([{ field: "createdAt", direction: "desc" }])
                ),
            ])
        ),
      S.divider(),
      // Everything else — products, categories, homepage, user, etc. — keep default listings
      ...S.documentTypeListItems().filter((item) => item.getId() !== "order"),
    ]);
