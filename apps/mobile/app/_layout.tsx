import { ClerkProvider, ClerkLoaded } from "@clerk/expo";
import { Slot } from "expo-router";
import { clerkPublishableKey } from "@/lib/clerk";

export default function RootLayout() {
  return (
    <ClerkProvider publishableKey={clerkPublishableKey}>
      <ClerkLoaded>
        <Slot />
      </ClerkLoaded>
    </ClerkProvider>
  );
}
