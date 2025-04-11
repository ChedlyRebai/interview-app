import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import React from "react";
import { Control, Controller, Field, FieldValues, Path } from "react-hook-form";

interface FormFieldProps<T extends FieldValues> {
    control: Control<T>;
    name: Path<T>;
    label: string;
    plcaceholder: string;
    type?: "text" | "email" | "password";
}

const FormField = <T extends FieldValues>({
    control,
    name,
    label,
    plcaceholder,
    type = "text",
}: FormFieldProps<T>) => (
    <Controller
        control={control}
        name={name}
        render={({ field }) => (
            <FormItem className="w-full">
                <FormLabel>{label}</FormLabel>
                <FormControl>
                    <Input
                        {...field}
                        type={type}
                        placeholder={plcaceholder}
                        {...field}

                    />
                </FormControl>
                <FormDescription>{plcaceholder}</FormDescription>
                <FormMessage />
            </FormItem>
        )}
    />

)

export default FormField;
