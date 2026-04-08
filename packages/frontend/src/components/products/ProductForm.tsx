import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductForm as PF } from '@/lib/validators'
import { useCreateProduct, useUpdateProduct, useGenerateImage } from '@/hooks/use-products'
import { useToast } from '@/contexts/ToastContext'
import type { Product } from '@/types'

interface Props { product?: Product; onSuccess: () => void }

export function ProductForm({ product, onSuccess }: Props) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<PF>({
    resolver: zodResolver(productSchema),
    defaultValues: product ? { name: product.name, description: product.description ?? '', price: product.price, stock: product.stock, imageUrl: product.imageUrl ?? '' } : undefined,
  })
  const create = useCreateProduct()
  const update = useUpdateProduct()
  const genImage = useGenerateImage()
  const { addToast } = useToast()
  const isPending = create.isPending || update.isPending
  const imageUrl = watch('imageUrl')

  const onSubmit = async (data: PF) => {
    try {
      if (product) { await update.mutateAsync({ id: product.id, ...data }) }
      else { await create.mutateAsync(data) }
      addToast('success', product ? '상품이 수정되었습니다' : '상품이 추가되었습니다')
      onSuccess()
    } catch { addToast('error', '저장에 실패했습니다') }
  }

  const handleGenerate = async () => {
    const name = watch('name')
    if (!name) return
    try {
      const res = await genImage.mutateAsync({ productName: name, description: watch('description') ?? '' })
      setValue('imageUrl', res.imageUrl)
    } catch { addToast('error', '이미지 생성에 실패했습니다') }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" data-testid="product-form">
      <div>
        <input {...register('name')} placeholder="상품명" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <textarea {...register('description')} placeholder="설명" rows={3} className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
      <div className="grid grid-cols-2 gap-4">
        <div>
          <input {...register('price')} type="number" step="0.01" placeholder="가격" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
        </div>
        <div>
          <input {...register('stock')} type="number" placeholder="재고" className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          {errors.stock && <p className="text-red-500 text-xs mt-1">{errors.stock.message}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <input {...register('imageUrl')} placeholder="이미지 URL" className="flex-1 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
        <button type="button" onClick={handleGenerate} disabled={genImage.isPending} data-testid="generate-image-button"
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 whitespace-nowrap text-sm">
          {genImage.isPending ? '생성 중...' : 'AI 이미지'}
        </button>
      </div>
      {imageUrl && <img src={imageUrl} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />}
      <button type="submit" disabled={isPending} data-testid="product-form-submit"
        className="w-full py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 disabled:opacity-50 font-medium">
        {isPending ? '저장 중...' : product ? '수정' : '추가'}
      </button>
    </form>
  )
}
