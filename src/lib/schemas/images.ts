import {z} from "zod";

export const PullImageSchema = z.object({
    name: z.string({error: "Image name us required"}).min(2, {error: "Looks like someone playing."}),
    tag: z.string().default("latest"),
    arch: z.string({error: "Os arch is required to know which image to pull."}).default("aarch64"),
    platform: z.string().optional(),
    scheme: z.enum(["auto", 'https', 'http'], {error: "Required to know which connection method to use while connecting with registry."}).default('auto'),
    debug: z.boolean({error: "Debug container"}).default(false),
})

export type PullImageValidatedDataType = ReturnType<typeof PullImageSchema.safeParse>

export type PullImageDetails = z.infer<typeof PullImageSchema>