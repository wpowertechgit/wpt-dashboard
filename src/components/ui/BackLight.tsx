{/* We will use this component on the navbar logo , and we gonna animate it so the logo has a cool aura
    npx shadcn@latest add @magicui/backlight
<Backlight>
  <img src="https://some-url/image.png" />
</Backlight>
Props
Prop	Type	Default	Description
blur	number	20	The blur intensity of the backlight glow effect.
children	React.ReactElement	-	The video, image, or SVG element to apply the backlight effect to.
className	string	-	Additional class names for the wrapper div.
    */}
import { Backlight } from "@/registry/magicui/backlight"
export function BacklightImageDemo() {
    return (
        <Backlight className="w-full">
            <img
                className="mx-auto h-auto w-full max-w-lg rounded-xl"
                src={
                    "https://plus.unsplash.com/premium_photo-1672201106204-58e9af7a2888?q=80&w=1171&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
                alt="fancy gradient background"
            />
        </Backlight>
    )
}
