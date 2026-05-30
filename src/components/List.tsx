import { CheckboxIcon } from "@/components/Icons"
import { Delete } from "@/components/TouchableIcons"
import type { ListProps } from "@/interfaces/ListProps"
import type { ProductProps } from "@/interfaces/ProductProps"
import { AlertService } from "@/services/AlertService"
import { SortProductsAlphabetically } from '@/utils/functions/SortList'
import { FormatTextLine } from "@/utils/functions/StringFunctions"
import { useRouter } from "expo-router"
import React from 'react'
import { ScrollView, Text, TouchableOpacity, View } from "react-native"

export function List({ cartStore }: ListProps) {
    const nav = useRouter()

    function toggleCollected(prod: ProductProps): void {
        cartStore.edit({ ...prod, collected: !prod.collected })
    }

    return (
        <ScrollView>
            {SortProductsAlphabetically.call(cartStore.products)
                .map((prod: ProductProps, i: number) => (
                    <View className="px-4 " key={prod.id}>
                        <View className="flex-row gap-2 items-center">
                            <Delete
                                action={() =>
                                    AlertService.remove(() => cartStore.remove(prod.id), prod)
                                }
                            />

                            <TouchableOpacity
                                className="flex-row items-center space-x-2"
                                onPress={() => toggleCollected(prod)}
                            >
                                <CheckboxIcon checked={prod.collected} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => nav.push(`/list/edit/${prod.id}`)} className="flex-1">
                                <Text
                                    className={`pl-2 mr-14 text-xl ${prod.collected
                                        ? " line-through text-gray-600 "
                                        : " text-white "
                                        }`}
                                >
                                    {FormatTextLine(prod)}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {i !== cartStore.products.length - 1 && (
                            <View className="border-b border-gray-500 my-2" />
                        )}
                    </View>
                ))}
        </ScrollView>
    )
}
