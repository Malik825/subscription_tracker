
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Loader2, CheckCircle, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios"; // USE YOUR EXISTING AXIOS INSTANCE
import { useNavigate } from "react-router-dom";

export function ReceiptScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setExtractedData(null);
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    setIsScanning(true);

    try {
      const formData = new FormData();
      formData.append("receipt", file);

      // USE AXIOS WITH FORM DATA (cookies included automatically)
      const response = await api.post("/ai/scan-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setExtractedData(response.data.data);
      toast({
        title: "Receipt scanned!",
        description: "Review the extracted data and save if correct.",
      });
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      toast({
        title: "Scan failed",
        description: error.response?.data?.message || "Failed to scan receipt",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) return;

    try {
      const response = await api.post("/ai/create-from-receipt", { 
        extractedData 
      });

      toast({
        title: "Subscription created!",
        description: `${response.data.data.name} has been added to your subscriptions.`,
      });

      setFile(null);
      setPreview(null);
      setExtractedData(null);
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast({
          title: "Session Expired",
          description: "Please login again",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to create subscription",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Upload Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Upload Receipt</h3>
            <p className="text-sm text-muted-foreground">
              Upload a photo of your subscription receipt or bill
            </p>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center",
              preview ? "border-primary" : "border-muted-foreground/25"
            )}
          >
            <input
              type="file"
              id="receipt-upload"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {preview ? (
              <div className="space-y-4">
                <img
                  src={preview}
                  alt="Receipt preview"
                  className="max-h-64 mx-auto rounded-lg object-contain"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    setFile(null);
                    setPreview(null);
                    setExtractedData(null);
                  }}
                >
                  Change Image
                </Button>
              </div>
            ) : (
              <label htmlFor="receipt-upload" className="cursor-pointer">
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="h-12 w-12 text-muted-foreground" />
                  <p className="text-sm font-medium">Click to upload</p>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG up to 10MB
                  </p>
                </div>
              </label>
            )}
          </div>

          <Button
            onClick={handleScan}
            disabled={!file || isScanning}
            className="w-full"
          >
            {isScanning ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Scan Receipt
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Extracted Data Section */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold mb-2">Extracted Data</h3>
            <p className="text-sm text-muted-foreground">
              Review and edit the extracted information
            </p>
          </div>

          {extractedData ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input
                  value={extractedData.name}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    value={extractedData.amount}
                    onChange={(e) =>
                      setExtractedData({
                        ...extractedData,
                        amount: parseFloat(e.target.value),
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Currency</Label>
                  <Input
                    value={extractedData.currency}
                    onChange={(e) =>
                      setExtractedData({ ...extractedData, currency: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Billing Cycle</Label>
                <Input
                  value={extractedData.billingCycle}
                  onChange={(e) =>
                    setExtractedData({
                      ...extractedData,
                      billingCycle: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Input
                  value={extractedData.category}
                  onChange={(e) =>
                    setExtractedData({ ...extractedData, category: e.target.value })
                  }
                />
              </div>

              <Button onClick={handleSave} className="w-full">
                <CheckCircle className="mr-2 h-4 w-4" />
                Save Subscription
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-center">
              <p className="text-sm text-muted-foreground">
                Upload and scan a receipt to see extracted data here
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
