import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import api from "@/lib/axios";
import { useNavigate } from "react-router-dom";
import { SubscriptionFormDialog } from "./SubscriptionFormDialog";

interface ExtractedData {
  name: string;
  price: number;
  currency: string;
  frequency: string;
  category: string;
  startDate?: string;
  renewalDate?: string;
  website?: string;
  status?: string;
}

interface ScanResponse {
  extracted: boolean;
  data: ExtractedData;
  confidence: string;
}

interface ErrorResponse {
  response?: {
    status?: number;
    data?: {
      message?: string;
    };
  };
}

export function ReceiptScanner() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
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

      const response = await api.post<{ data: ScanResponse }>("/ai/scan-receipt", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      // Extract the nested data from the response
      const scanResult = response.data.data;
      const extractedSubscriptionData = scanResult.data;

      setExtractedData(extractedSubscriptionData);
      
      toast({
        title: "Receipt scanned successfully! ✨",
        description: "AI has extracted the data. Review and save your subscription.",
      });

      // Open the form dialog with pre-filled data
      setShowForm(true);
    } catch (err) {
      const error = err as ErrorResponse;
      
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

  const handleFormSuccess = (message: string) => {
    toast({
      title: "Success",
      description: message,
    });

    // Reset everything
    setFile(null);
    setPreview(null);
    setExtractedData(null);
    setShowForm(false);
  };

  return (
    <>
      <Card className="p-6 max-w-2xl mx-auto">
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">AI Receipt Scanner</h2>
            <p className="text-sm text-muted-foreground">
              Upload a photo of your subscription receipt or bill, and let AI extract the details
            </p>
          </div>

          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
              preview ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-muted-foreground/50"
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
                  className="max-h-80 mx-auto rounded-lg object-contain shadow-lg"
                />
                <div className="flex gap-2 justify-center">
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
                  <Button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="min-w-[140px]"
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
              </div>
            ) : (
              <label htmlFor="receipt-upload" className="cursor-pointer block">
                <div className="flex flex-col items-center gap-3 py-8">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="text-base font-medium mb-1">Click to upload receipt</p>
                    <p className="text-sm text-muted-foreground">
                      PNG, JPG, or JPEG up to 10MB
                    </p>
                  </div>
                </div>
              </label>
            )}
          </div>

          {/* Info box */}
          <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h4 className="font-medium text-sm mb-2 text-blue-900 dark:text-blue-100">
              💡 How it works
            </h4>
            <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
              <li>• Upload a clear photo of your subscription receipt or bill</li>
              <li>• AI will extract the service name, price, billing cycle, and category</li>
              <li>• Review the extracted data and make any corrections</li>
              <li>• Save to add it to your subscription tracker</li>
            </ul>
          </div>
        </div>
      </Card>

      {/* Subscription Form Dialog with pre-filled data */}
      <SubscriptionFormDialog
        open={showForm}
        onOpenChange={setShowForm}
        mode="create"
        initialData={extractedData || {}}
        isExtracted={!!extractedData}
        onSuccess={handleFormSuccess}
      />
    </>
  );
}