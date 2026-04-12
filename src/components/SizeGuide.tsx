import { X, Ruler } from "lucide-react";
import { useEffect } from "react";

const SizeGuide = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => { document.body.style.overflow = ""; };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-card border border-border w-full max-w-2xl mx-4 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <Ruler size={18} className="text-primary" />
            <h2 className="font-display text-2xl text-foreground">Size Guide</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Tops */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-4">Tops & Knitwear</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Size</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Chest (in)</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Waist (in)</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Length (in)</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    { size: "S", chest: "36-38", waist: "30-32", length: "27" },
                    { size: "M", chest: "38-40", waist: "32-34", length: "28" },
                    { size: "L", chest: "40-42", waist: "34-36", length: "29" },
                    { size: "XL", chest: "42-44", waist: "36-38", length: "30" },
                    { size: "XXL", chest: "44-46", waist: "38-40", length: "31" },
                  ].map((r) => (
                    <tr key={r.size} className="border-b border-border/50">
                      <td className="py-3 pr-4 text-foreground font-medium">{r.size}</td>
                      <td className="py-3 px-4 text-center">{r.chest}</td>
                      <td className="py-3 px-4 text-center">{r.waist}</td>
                      <td className="py-3 px-4 text-center">{r.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Trousers */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-4">Trousers</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Size</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Waist (in)</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Hip (in)</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">Inseam (in)</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    { size: "28", waist: "28", hip: "36", inseam: "30" },
                    { size: "30", waist: "30", hip: "38", inseam: "31" },
                    { size: "32", waist: "32", hip: "40", inseam: "32" },
                    { size: "34", waist: "34", hip: "42", inseam: "32" },
                    { size: "36", waist: "36", hip: "44", inseam: "33" },
                  ].map((r) => (
                    <tr key={r.size} className="border-b border-border/50">
                      <td className="py-3 pr-4 text-foreground font-medium">{r.size}</td>
                      <td className="py-3 px-4 text-center">{r.waist}</td>
                      <td className="py-3 px-4 text-center">{r.hip}</td>
                      <td className="py-3 px-4 text-center">{r.inseam}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Footwear */}
          <div>
            <h3 className="font-display text-lg text-foreground mb-4">Footwear</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm font-body">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 pr-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">US</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">UK</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">EU</th>
                    <th className="text-center py-3 px-4 text-[10px] tracking-[0.15em] uppercase text-muted-foreground">CM</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  {[
                    { us: "7", uk: "6", eu: "40", cm: "25" },
                    { us: "8", uk: "7", eu: "41", cm: "26" },
                    { us: "9", uk: "8", eu: "42", cm: "27" },
                    { us: "10", uk: "9", eu: "43", cm: "28" },
                    { us: "11", uk: "10", eu: "44", cm: "29" },
                    { us: "12", uk: "11", eu: "45", cm: "30" },
                  ].map((r) => (
                    <tr key={r.us} className="border-b border-border/50">
                      <td className="py-3 pr-4 text-foreground font-medium">{r.us}</td>
                      <td className="py-3 px-4 text-center">{r.uk}</td>
                      <td className="py-3 px-4 text-center">{r.eu}</td>
                      <td className="py-3 px-4 text-center">{r.cm}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* How to measure */}
          <div className="bg-secondary/50 p-5">
            <h4 className="font-display text-base text-foreground mb-3">How to Measure</h4>
            <ul className="space-y-2 font-body text-xs text-muted-foreground leading-relaxed">
              <li><span className="text-foreground">Chest:</span> Measure around the fullest part of your chest, keeping the tape level.</li>
              <li><span className="text-foreground">Waist:</span> Measure around your natural waistline, keeping the tape comfortably loose.</li>
              <li><span className="text-foreground">Hip:</span> Measure around the fullest part of your hips.</li>
              <li><span className="text-foreground">Inseam:</span> Measure from the crotch seam to the bottom of the leg.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SizeGuide;
