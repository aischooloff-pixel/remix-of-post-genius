import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { IdeaFormData, PostVariant } from "@/types/post";

export function useAI() {
  const [isGeneratingVariants, setIsGeneratingVariants] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  const generateVariants = async (data: IdeaFormData): Promise<PostVariant[]> => {
    setIsGeneratingVariants(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-variants', {
        body: {
          idea: data.idea,
          tone: data.tone,
          length: data.length,
          goal: data.goal,
          targetAudience: data.targetAudience,
          template: data.template,
        },
      });

      if (error) {
        console.error("Generate variants error:", error);
        throw new Error(error.message || "Failed to generate variants");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      const variants = result.variants.map((v: any) => ({
        ...v,
        createdAt: new Date(v.createdAt),
      }));

      return variants;
    } catch (error: any) {
      console.error("Error generating variants:", error);
      
      if (error.message?.includes("Rate limit")) {
        toast.error("Слишком много запросов. Подождите немного.");
      } else if (error.message?.includes("Payment required")) {
        toast.error("Необходимо пополнить баланс.");
      } else {
        toast.error("Ошибка генерации: " + (error.message || "Неизвестная ошибка"));
      }
      
      throw error;
    } finally {
      setIsGeneratingVariants(false);
    }
  };

  const editByAI = async (text: string, instruction: string): Promise<{ text: string; textMarkdown: string; textHtml: string }> => {
    setIsEditing(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('edit-by-ai', {
        body: { text, instruction },
      });

      if (error) {
        throw new Error(error.message || "Failed to edit text");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error: any) {
      console.error("Error editing text:", error);
      toast.error("Ошибка редактирования: " + (error.message || "Неизвестная ошибка"));
      throw error;
    } finally {
      setIsEditing(false);
    }
  };

  const generateImage = async (
    prompt: string, 
    style?: string, 
    count: number = 1
  ): Promise<Array<{ id: string; url: string; type: string; generatedBy: string }>> => {
    setIsGeneratingImage(true);
    
    try {
      const { data: result, error } = await supabase.functions.invoke('generate-image', {
        body: { prompt, style, count },
      });

      if (error) {
        throw new Error(error.message || "Failed to generate image");
      }

      if (result.error) {
        throw new Error(result.error);
      }

      return result.images;
    } catch (error: any) {
      console.error("Error generating image:", error);
      toast.error("Ошибка генерации изображения: " + (error.message || "Неизвестная ошибка"));
      throw error;
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return {
    generateVariants,
    editByAI,
    generateImage,
    isGeneratingVariants,
    isEditing,
    isGeneratingImage,
  };
}
