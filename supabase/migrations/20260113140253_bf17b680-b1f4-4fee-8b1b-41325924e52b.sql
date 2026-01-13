-- Allow users to delete their own couple (only if they are user1 and there's no partner yet)
CREATE POLICY "Users can delete their empty couple" 
ON public.couples 
FOR DELETE 
USING (auth.uid() = user1_id AND user2_id IS NULL);