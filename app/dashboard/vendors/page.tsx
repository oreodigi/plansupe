import { Plus, Storefront } from "@phosphor-icons/react/dist/ssr";
import { redirect } from "next/navigation";
import { AppFrame } from "@/components/app-frame";
import { createVendorAction } from "@/app/actions";
import { getBusinessData } from "@/lib/db";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export default async function VendorsPage({
  searchParams,
}: {
  searchParams: Promise<{ business?: string }>;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) redirect("/sign-in");
  const query = await searchParams;
  const result = await getBusinessData(query.business);
  if (!result.business) redirect("/dashboard");
  const fullName = String(
    data.user.user_metadata?.full_name ||
      data.user.email?.split("@")[0] ||
      "Founder",
  );
  return (
    <AppFrame
      businesses={result.businesses}
      business={result.business}
      businessModules={result.businessModules}
      name={fullName}
      email={data.user.email || ""}
    >
      <section className="page-head">
        <div>
          <p className="eyebrow">People you work with</p>
          <h1>Vendors</h1>
          <p>Keep supplier and specialist contacts easy to find.</p>
        </div>
      </section>
      <div className="split-layout">
        <section className="content-card">
          <div className="section-heading">
            <h2>Directory</h2>
            <span className="count-pill">{result.vendors.length}</span>
          </div>
          <div className="vendor-grid">
            {result.vendors.length === 0 && (
              <div className="empty-state">
                <Storefront size={34} weight="duotone" />
                <h3>No vendors saved</h3>
                <p>Add the first contact for this business.</p>
              </div>
            )}
            {result.vendors.map((vendor) => (
              <article className="vendor-card" key={vendor.id}>
                <span className="vendor-mark">
                  {vendor.name[0]?.toUpperCase()}
                </span>
                <div>
                  <h3>{vendor.name}</h3>
                  <p>{vendor.category || "General vendor"}</p>
                  {vendor.contact_name && (
                    <span>{vendor.contact_name}</span>
                  )}{" "}
                  {vendor.phone && (
                    <a href={`tel:${vendor.phone}`}>{vendor.phone}</a>
                  )}{" "}
                  {vendor.email && (
                    <a href={`mailto:${vendor.email}`}>{vendor.email}</a>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
        <aside className="content-card add-card">
          <h2>
            <Plus size={20} />
            Add vendor
          </h2>
          <form action={createVendorAction}>
            <input type="hidden" name="businessId" value={result.business.id} />
            <label>
              <span>Company or vendor name</span>
              <input name="name" required minLength={2} />
            </label>
            <label>
              <span>Category</span>
              <input name="category" placeholder="e.g. Equipment" />
            </label>
            <label>
              <span>Contact person</span>
              <input name="contactName" />
            </label>
            <div className="form-grid">
              <label>
                <span>Phone</span>
                <input name="phone" type="tel" />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" />
              </label>
            </div>
            <button className="btn primary">Save vendor</button>
          </form>
        </aside>
      </div>
    </AppFrame>
  );
}
