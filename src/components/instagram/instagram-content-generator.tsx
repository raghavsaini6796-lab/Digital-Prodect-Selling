"use client";

import { useState } from "react";
import { Image as ImageIcon, Images, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const postTypes = [
  { value: "single", label: "Single Image" },
  { value: "carousel", label: "Carousel (Multi-slide)" },
  { value: "reel", label: "Reel (Video)" },
];

export default function InstagramContentGenerator() {
  const [postType, setPostType] = useState("single");
  const [caption, setCaption] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previewImage, setPreviewImage] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(Array.from(e.target.files));
      setPreviewImage(URL.createObjectURL(e.target.files[0]));
    }
  };

  const generatePreview = () => {
    console.log("Generating preview for:", { postType, caption, files });
  };

  return (
    <div className="bg-[#1e1e1e] p-6 rounded-xl shadow-lg border border-[#333]">
      <h2 className="text-2xl font-bold text-white mb-6">Create Instagram Post</h2>
      
      <div className="mb-4 space-y-2">
        <Label className="text-gray-400 font-medium">Post Type</Label>
        <Select 
          value={postType} 
          onValueChange={(val) => setPostType(val || "single")} 
        >
          <SelectTrigger className="bg-[#2a2a2a] text-white border-[#444] focus:border-purple-500">
            <SelectValue placeholder="Select post type" />
          </SelectTrigger>
          <SelectContent className="bg-[#2a2a2a] text-white border-[#444]">
            {postTypes.map((pt) => (
              <SelectItem key={pt.value} value={pt.value} className="focus:bg-[#333] focus:text-white cursor-pointer">
                {pt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4 space-y-2">
        <Label className="text-gray-400 font-medium">Caption</Label>
        <Textarea 
          placeholder="Write your captivating caption here..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="bg-[#2a2a2a] text-white border-[#444] min-h-[120px] focus:border-purple-500 placeholder:text-gray-500"
        />
      </div>

      <div className="mb-6 relative group border-2 border-dashed border-[#444] hover:border-purple-500 rounded-xl p-8 transition-all duration-200 cursor-pointer bg-[#222]">
        <input 
          type="file" 
          multiple 
          accept="image/*,video/mp4" 
          onChange={handleFileChange} 
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="flex flex-col items-center justify-center text-center gap-2">
          {postType === "single" && <ImageIcon size={32} color="#8b5cf6" />}
          {postType === "carousel" && <Images size={32} color="#8b5cf6" />}
          {postType === "reel" && <Video size={32} color="#8b5cf6" />}
          <span className="text-sm font-medium text-gray-300">Click to upload or drag and drop</span>
          <span className="text-xs text-gray-500">Supports JPG, PNG, MP4</span>
        </div>
      </div>

      <Button 
        onClick={generatePreview} 
        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6 rounded-lg shadow-md transition-all border-0"
      >
        Generate Preview
      </Button>

      {previewImage && (
        <div className="mt-8 border-t border-[#444] pt-6">
          <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
          <img src={previewImage} alt="Post Preview" className="w-full max-h-[400px] object-cover rounded-lg shadow-md" />
        </div>
      )}
    </div>
  );
}
