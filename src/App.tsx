import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Download, ImageIcon, Loader2, Wand2, RefreshCw, Trash2, X, ZoomIn, History, Lightbulb } from 'lucide-react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  timestamp: Date;
  seed: number;
}

const EXAMPLE_PROMPTS = [
  "A serene Japanese garden with cherry blossoms and a koi pond at sunset",
  "A futuristic cyberpunk cityscape with neon lights and flying cars",
  "A majestic dragon soaring over snow-capped mountains",
  "An underwater coral reef with bioluminescent creatures",
  "A cozy cottage in an enchanted forest with fairy lights",
  "A astronaut riding a horse on Mars with Earth in the sky",
  "A steampunk clock tower in a Victorian city",
  "A magical library with floating books and glowing crystals"
];

function App() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [progress, setProgress] = useState(0);
  const [showHistory, setShowHistory] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ai-generated-images');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setGeneratedImages(parsed.map((img: any) => ({
          ...img,
          timestamp: new Date(img.timestamp)
        })));
      } catch (e) {
        console.error('Failed to load saved images:', e);
      }
    }
  }, []);

  // Save to localStorage whenever images change
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem('ai-generated-images', JSON.stringify(generatedImages));
    }
  }, [generatedImages]);

  const generateImage = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setProgress(0);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 500);

    try {
      const seed = Math.floor(Math.random() * 1000000);
      const encodedPrompt = encodeURIComponent(prompt.trim());
      const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${seed}&enhance=true`;

      // Preload the image to ensure it's ready
      await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = reject;
        img.src = imageUrl;
        // Timeout after 30 seconds
        setTimeout(() => reject(new Error('Timeout')), 30000);
      });

      const newImage: GeneratedImage = {
        id: `${Date.now()}-${seed}`,
        url: imageUrl,
        prompt: prompt.trim(),
        timestamp: new Date(),
        seed
      };

      setGeneratedImages(prev => [newImage, ...prev]);
      setPrompt('');
      setProgress(100);
    } catch (error) {
      console.error('Generation failed:', error);
      alert('Image generation failed. Please try again with a different prompt.');
    } finally {
      clearInterval(progressInterval);
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 500);
    }
  }, [prompt, isGenerating]);

  const downloadImage = useCallback(async (image: GeneratedImage) => {
    try {
      const response = await fetch(image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ai-generated-${image.seed}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(image.url, '_blank');
    }
  }, []);

  const deleteImage = useCallback((id: string) => {
    setGeneratedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      if (filtered.length === 0) {
        localStorage.removeItem('ai-generated-images');
      }
      return filtered;
    });
    if (selectedImage?.id === id) {
      setSelectedImage(null);
    }
  }, [selectedImage]);

  const regenerateImage = useCallback(async (image: GeneratedImage) => {
    setPrompt(image.prompt);
    // Small delay to let the prompt update
    setTimeout(() => {
      const generateBtn = document.getElementById('generate-btn');
      generateBtn?.click();
    }, 100);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      generateImage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white">
      {/* Animated background particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-purple-300 bg-clip-text text-transparent">
                AI Image Generator
              </h1>
              <p className="text-xs text-white/50 hidden sm:block">Powered by Pollinations AI</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {generatedImages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowHistory(!showHistory)}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <History className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">History</span>
                <Badge variant="secondary" className="ml-2 bg-white/20 text-white">
                  {generatedImages.length}
                </Badge>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-10">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Create Stunning AI Art
          </h2>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Type any description and watch AI bring your imagination to life. 
            No sign-up required, completely free.
          </p>
        </div>

        {/* Input Section */}
        <Card className="max-w-3xl mx-auto mb-10 bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden">
          <div className="p-6">
            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Wand2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-400" />
                <Input
                  placeholder="Describe the image you want to create..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="pl-10 h-14 bg-white/5 border-white/20 text-white placeholder:text-white/40 text-lg focus:border-purple-500 focus:ring-purple-500/20"
                  disabled={isGenerating}
                />
              </div>
              <Button
                id="generate-btn"
                onClick={generateImage}
                disabled={!prompt.trim() || isGenerating}
                className="h-14 px-6 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold shadow-lg shadow-purple-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>

            {/* Progress bar */}
            {isGenerating && (
              <div className="mb-4">
                <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  />
                </div>
                <p className="text-sm text-white/50 mt-2 text-center animate-pulse">
                  Creating your masterpiece... This may take 10-20 seconds
                </p>
              </div>
            )}

            {/* Example Prompts */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-yellow-400" />
                <span className="text-sm text-white/60">Try these examples:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(example)}
                    disabled={isGenerating}
                    className="text-xs px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-purple-500/50 text-white/70 hover:text-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {example.length > 40 ? example.substring(0, 40) + '...' : example}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Gallery Section */}
        {generatedImages.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-semibold text-white flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-purple-400" />
                Your Creations
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (confirm('Clear all generated images?')) {
                    setGeneratedImages([]);
                    localStorage.removeItem('ai-generated-images');
                  }
                }}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {generatedImages.map((image) => (
                <Card
                  key={image.id}
                  className="group bg-white/5 border-white/10 backdrop-blur-xl overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10"
                >
                  <div className="relative aspect-square overflow-hidden bg-black/40">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="absolute bottom-0 left-0 right-0 p-4">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => setSelectedImage(image)}
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"
                          >
                            <ZoomIn className="w-4 h-4 mr-1" />
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => downloadImage(image)}
                            className="flex-1 bg-white/20 hover:bg-white/30 text-white backdrop-blur-md"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-white/80 line-clamp-2 mb-2">{image.prompt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-white/40">
                        {image.timestamp.toLocaleDateString()} {image.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => regenerateImage(image)}
                          className="w-8 h-8 text-white/50 hover:text-white hover:bg-white/10"
                          title="Regenerate with same prompt"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteImage(image.id)}
                          className="w-8 h-8 text-white/50 hover:text-red-400 hover:bg-red-500/10"
                          title="Delete"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {generatedImages.length === 0 && !isGenerating && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-white/5 flex items-center justify-center">
              <ImageIcon className="w-12 h-12 text-white/20" />
            </div>
            <h3 className="text-xl font-semibold text-white/60 mb-2">No images yet</h3>
            <p className="text-white/40">Enter a prompt above to create your first AI-generated image</p>
          </div>
        )}
      </main>

      {/* Image Detail Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl bg-slate-950 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              Generated Image
            </DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden bg-black/40">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              <div className="space-y-2">
                <p className="text-white/80">{selectedImage.prompt}</p>
                <p className="text-sm text-white/40">
                  Generated on {selectedImage.timestamp.toLocaleString()}
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => downloadImage(selectedImage)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setPrompt(selectedImage.prompt);
                    setSelectedImage(null);
                  }}
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Regenerate
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* History Sidebar */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowHistory(false)} />
          <Card className="relative w-full max-w-md h-full bg-slate-950 border-white/10 rounded-none overflow-hidden flex flex-col">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-purple-400" />
                Generation History
              </h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setShowHistory(false)}
                className="text-white/60 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {generatedImages.map((image) => (
                  <Card
                    key={image.id}
                    className="bg-white/5 border-white/10 overflow-hidden cursor-pointer hover:border-purple-500/50 transition-colors"
                    onClick={() => {
                      setSelectedImage(image);
                      setShowHistory(false);
                    }}
                  >
                    <div className="flex gap-3 p-3">
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-20 h-20 rounded-lg object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 line-clamp-2">{image.prompt}</p>
                        <p className="text-xs text-white/40 mt-1">
                          {image.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </ScrollArea>
          </Card>
        </div>
      )}

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 mt-20 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-white/40 text-sm">
            Powered by <a href="https://pollinations.ai" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300">Pollinations AI</a> • 
            Free & Open Source • 
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-purple-400 hover:text-purple-300 ml-1">Host on GitHub Pages</a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
