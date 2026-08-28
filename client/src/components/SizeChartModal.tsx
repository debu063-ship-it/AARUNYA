import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Ruler, Maximize2, Check, Sparkles, HelpCircle, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SizeChartModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  category: string;
  sizeChartUrl?: string | null;
  availableSizes?: string[];
}

type MeasurementRow = {
  size: string;
  chestIn: string;
  chestCm: string;
  lengthIn: string;
  lengthCm: string;
  shoulderIn: string;
  shoulderCm: string;
  sleeveIn: string;
  sleeveCm: string;
};

type BottomMeasurementRow = {
  size: string;
  waistIn: string;
  waistCm: string;
  lengthIn: string;
  lengthCm: string;
  hipIn: string;
  hipCm: string;
  thighIn: string;
  thighCm: string;
};

const TOPS_MEASUREMENTS: MeasurementRow[] = [
  { size: "XS", chestIn: "38", chestCm: "96.5", lengthIn: "27", lengthCm: "68.5", shoulderIn: "18.5", shoulderCm: "47", sleeveIn: "8.0", sleeveCm: "20.3" },
  { size: "S", chestIn: "40", chestCm: "101.6", lengthIn: "28", lengthCm: "71.1", shoulderIn: "19.5", shoulderCm: "49.5", sleeveIn: "8.5", sleeveCm: "21.6" },
  { size: "M", chestIn: "42", chestCm: "106.7", lengthIn: "29", lengthCm: "73.7", shoulderIn: "20.5", shoulderCm: "52", sleeveIn: "9.0", sleeveCm: "22.8" },
  { size: "L", chestIn: "44", chestCm: "111.8", lengthIn: "30", lengthCm: "76.2", shoulderIn: "21.5", shoulderCm: "54.5", sleeveIn: "9.5", sleeveCm: "24.1" },
  { size: "XL", chestIn: "46", chestCm: "116.8", lengthIn: "31", lengthCm: "78.7", shoulderIn: "22.5", shoulderCm: "57", sleeveIn: "10.0", sleeveCm: "25.4" },
  { size: "XXL", chestIn: "48", chestCm: "121.9", lengthIn: "32", lengthCm: "81.3", shoulderIn: "23.5", shoulderCm: "59.5", sleeveIn: "10.5", sleeveCm: "26.7" },
];

const BOTTOMS_MEASUREMENTS: BottomMeasurementRow[] = [
  { size: "XS", waistIn: "28-29", waistCm: "71-74", lengthIn: "39", lengthCm: "99", hipIn: "38", hipCm: "96.5", thighIn: "22", thighCm: "56" },
  { size: "S", waistIn: "30-31", waistCm: "76-79", lengthIn: "40", lengthCm: "101.6", hipIn: "40", hipCm: "101.6", thighIn: "23", thighCm: "58.5" },
  { size: "M", waistIn: "32-33", waistCm: "81-84", lengthIn: "41", lengthCm: "104.1", hipIn: "42", hipCm: "106.7", thighIn: "24", thighCm: "61" },
  { size: "L", waistIn: "34-35", waistCm: "86-89", lengthIn: "41.5", lengthCm: "105.4", hipIn: "44", hipCm: "111.8", thighIn: "25", thighCm: "63.5" },
  { size: "XL", waistIn: "36-37", waistCm: "91-94", lengthIn: "42", lengthCm: "106.7", hipIn: "46", hipCm: "116.8", thighIn: "26", thighCm: "66" },
  { size: "XXL", waistIn: "38-39", waistCm: "96-99", lengthIn: "42.5", lengthCm: "108", hipIn: "48", hipCm: "121.9", thighIn: "27", thighCm: "68.5" },
];

export const SizeChartModal: React.FC<SizeChartModalProps> = ({
  open,
  onOpenChange,
  productName,
  category,
  sizeChartUrl,
  availableSizes = [],
}) => {
  const [unit, setUnit] = useState<"in" | "cm">("in");
  const [activeTab, setActiveTab] = useState<"photo" | "table">(
    sizeChartUrl ? "photo" : "table"
  );
  const [isZoomed, setIsZoomed] = useState(false);

  const isBottoms = category.toLowerCase() === "bottoms";

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl p-6 sm:p-7">
          <DialogHeader className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl genz-gradient-bg flex items-center justify-center text-primary-foreground">
                <Ruler className="w-4 h-4" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black tracking-tight">
                  Size Guide & Measurements
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  {productName} · {category.toUpperCase()}
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          {/* Navigation Tabs (if custom photo exists) */}
          {sizeChartUrl && (
            <div className="flex border-b border-border/70 mt-3">
              <button
                type="button"
                onClick={() => setActiveTab("photo")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "photo"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Garment Size Chart Photo</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("table")}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 cursor-pointer ${
                  activeTab === "table"
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Measurement Table ({unit.toUpperCase()})</span>
              </button>
            </div>
          )}

          {/* 1. Custom Size Chart Photo View */}
          {sizeChartUrl && activeTab === "photo" && (
            <div className="space-y-4 pt-2">
              <div className="relative rounded-2xl border border-border/80 bg-muted/40 overflow-hidden group">
                <img
                  src={sizeChartUrl}
                  alt={`${productName} Size Chart`}
                  className="w-full h-auto max-h-[420px] object-contain mx-auto bg-white dark:bg-zinc-950 p-2 sm:p-4 rounded-xl cursor-zoom-in"
                  onClick={() => setIsZoomed(true)}
                />
                <button
                  type="button"
                  onClick={() => setIsZoomed(true)}
                  className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md backdrop-blur-xs transition-all cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Click to Expand</span>
                </button>
              </div>
              <p className="text-[11px] text-center text-muted-foreground">
                Official garment size specifications and dimensions provided by SlayPOP.
              </p>
            </div>
          )}

          {/* 2. Interactive Measurement Table */}
          {(!sizeChartUrl || activeTab === "table") && (
            <div className="space-y-4 pt-2">
              {/* Unit Toggle & Category Info */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Units:
                  </span>
                  <div className="inline-flex p-0.5 bg-muted rounded-lg border border-border">
                    <button
                      type="button"
                      onClick={() => setUnit("in")}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        unit === "in"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Inches (in)
                    </button>
                    <button
                      type="button"
                      onClick={() => setUnit("cm")}
                      className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                        unit === "cm"
                          ? "bg-background text-foreground shadow-xs"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      CM (cm)
                    </button>
                  </div>
                </div>

                <span className="text-[11px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Oversized Streetwear Fit
                </span>
              </div>

              {/* Table */}
              <div className="overflow-x-auto rounded-xl border border-border">
                <table className="w-full text-xs text-left">
                  <thead className="bg-muted/80 text-foreground uppercase tracking-wider font-bold border-b border-border">
                    <tr>
                      <th className="py-3 px-4">Size</th>
                      {isBottoms ? (
                        <>
                          <th className="py-3 px-4">Waist ({unit})</th>
                          <th className="py-3 px-4">Length ({unit})</th>
                          <th className="py-3 px-4">Hip ({unit})</th>
                          <th className="py-3 px-4">Thigh ({unit})</th>
                        </>
                      ) : (
                        <>
                          <th className="py-3 px-4">Chest ({unit})</th>
                          <th className="py-3 px-4">Length ({unit})</th>
                          <th className="py-3 px-4">Shoulder ({unit})</th>
                          <th className="py-3 px-4">Sleeve ({unit})</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 font-medium">
                    {isBottoms
                      ? BOTTOMS_MEASUREMENTS.map((row) => {
                          const isAvailable =
                            availableSizes.length === 0 ||
                            availableSizes.includes(row.size);
                          return (
                            <tr
                              key={row.size}
                              className={`hover:bg-muted/30 transition-colors ${
                                !isAvailable ? "opacity-40" : ""
                              }`}
                            >
                              <td className="py-3 px-4 font-bold text-foreground flex items-center gap-1.5">
                                <span>{row.size}</span>
                                {isAvailable && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                )}
                              </td>
                              <td className="py-3 px-4">{unit === "in" ? row.waistIn : row.waistCm}</td>
                              <td className="py-3 px-4">{unit === "in" ? row.lengthIn : row.lengthCm}</td>
                              <td className="py-3 px-4">{unit === "in" ? row.hipIn : row.hipCm}</td>
                              <td className="py-3 px-4">{unit === "in" ? row.thighIn : row.thighCm}</td>
                            </tr>
                          );
                        })
                      : TOPS_MEASUREMENTS.map((row) => {
                          const isAvailable =
                            availableSizes.length === 0 ||
                            availableSizes.includes(row.size);
                          return (
                            <tr
                              key={row.size}
                              className={`hover:bg-muted/30 transition-colors ${
                                !isAvailable ? "opacity-40" : ""
                              }`}
                            >
                              <td className="py-3 px-4 font-bold text-foreground flex items-center gap-1.5">
                                <span>{row.size}</span>
                                {isAvailable && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                )}
                              </td>
                              <td className="py-3 px-4">{unit === "in" ? row.chestIn : row.chestCm}</td>
                              <td className="py-3 px-4">{unit === "in" ? row.lengthIn : row.lengthCm}</td>
                              <td className="py-3 px-4">{unit === "in" ? row.shoulderIn : row.shoulderCm}</td>
                              <td className="py-3 px-4">{unit === "in" ? row.sleeveIn : row.sleeveCm}</td>
                            </tr>
                          );
                        })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* How to Measure Guidelines */}
          <div className="bg-card border border-border/80 rounded-xl p-4 space-y-2 mt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foreground flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-primary" />
              How to Measure
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div>
                <strong className="text-foreground">{isBottoms ? "Waist: " : "Chest: "}</strong>
                {isBottoms
                  ? "Measure around the natural waistband where your trousers sit."
                  : "Measure across the fullest part of the chest from underarm to underarm."}
              </div>
              <div>
                <strong className="text-foreground">Length: </strong>
                {isBottoms
                  ? "Measure from the waistband down to the bottom ankle hem."
                  : "Measure from the highest point of the shoulder down to the bottom hem."}
              </div>
              <div>
                <strong className="text-foreground">{isBottoms ? "Hip: " : "Shoulder: "}</strong>
                {isBottoms
                  ? "Measure around the widest part of your hips."
                  : "Measure across the back from shoulder seam to shoulder seam."}
              </div>
              <div>
                <strong className="text-foreground">{isBottoms ? "Fit Tip: " : "Sleeve: "}</strong>
                {isBottoms
                  ? "For relaxed baggy fit, select your true size. For tailored fit, size down."
                  : "Measure from the shoulder seam down to the outer cuff edge."}
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-xl px-5 text-xs font-bold"
            >
              Got It
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expanded Image Lightbox / Zoom Dialog */}
      {sizeChartUrl && (
        <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
          <DialogContent className="max-w-4xl max-h-[95vh] p-2 sm:p-4 rounded-2xl bg-black/95 border-border/40 text-white">
            <div className="relative flex flex-col items-center justify-center p-2">
              <img
                src={sizeChartUrl}
                alt={`${productName} Size Chart Full`}
                className="max-h-[80vh] w-auto object-contain rounded-xl shadow-2xl"
              />
              <div className="mt-3 flex items-center justify-between w-full px-2 text-xs text-zinc-400">
                <span>{productName} — Size Chart</span>
                <button
                  type="button"
                  onClick={() => setIsZoomed(false)}
                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default SizeChartModal;
