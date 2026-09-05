import { Link } from 'react-router-dom'

export default function PetCard({ pet, variant = 'compact', onEdit, onDelete, onToggleFavorite, isMain = false, add = false }) {
  if (add) {
    return (
      <Link to="/pets" className="flex h-[142px] w-[121px] shrink-0 flex-col items-center justify-center gap-2 rounded-[24px] border border-dashed border-slate-300 bg-white px-2 py-3 text-slate-400 active:bg-slate-50">
        <span className="grid size-14 place-items-center rounded-full bg-slate-50 text-slate-400"><i className="fa-solid fa-plus text-xl font-normal" /></span>
        <span className="text-xs font-medium">เพิ่มสัตว์เลี้ยง</span>
      </Link>
    )
  }

  const image = pet.image ? (
    <img src={pet.image} alt={pet.name} className="h-full w-full object-cover" />
  ) : (
    <i className={`fa-solid ${pet.icon || (pet.type === 'สุนัข' ? 'fa-dog' : 'fa-cat')} text-orange-300`} />
  )

  if (variant === 'full') {
    return (
      <article className="relative overflow-hidden rounded-[24px] border border-gray-100 bg-white shadow-[0_4px_16px_rgba(15,23,42,0.07)]">
        <div className="p-3">
          <div className="flex gap-3">
            <div className="relative flex h-[142px] w-[128px] shrink-0 items-center justify-center overflow-hidden rounded-[19px] bg-orange-50">
              <div className="h-full w-full flex items-center justify-center text-[82px]">{image}</div>
            </div>

            <div className="min-w-0 flex-1 py-2 pl-3 pr-10">
              <div className="min-w-0">
                <h3 className="m-0 truncate text-xl font-bold text-gray-900">
                  {pet.name}{' '}
                  <span className={pet.gender === 'ตัวเมีย' ? 'text-pink-500' : 'text-green-500'}>
                    {pet.gender === 'ตัวเมีย' ? '♀' : '♂'}
                  </span>
                </h3>
                <p className="m-0 mt-0.5 truncate text-xs text-gray-600">{pet.breed || 'ไม่ระบุสายพันธุ์'}</p>
              </div>

              <div className="mt-3 space-y-2 text-xs text-gray-700">
                <div className="flex items-center gap-2"><i className="fa-solid fa-paw w-4 text-gray-400" /><span>{pet.type}</span></div>
                <div className="flex items-center gap-2"><i className="fa-regular fa-calendar w-4 text-gray-400" /><span>{pet.age || '-'}</span></div>
                <div className="flex items-center gap-2"><i className="fa-solid fa-weight-scale w-4 text-gray-400" /><span>{pet.weight || '-'}</span></div>
              </div>
            </div>
          </div>

          <button type="button" aria-label={pet.favorite ? 'ยกเลิกสัตว์เลี้ยงโปรด' : 'เพิ่มสัตว์เลี้ยงโปรด'} onClick={() => onToggleFavorite?.(pet)} className="absolute right-4 top-4 grid size-10 place-items-center rounded-full border border-gray-100 bg-white text-base shadow-sm active:scale-90">
            <i className={`${pet.favorite ? 'fa-solid text-orange-500' : 'fa-regular text-gray-300'} fa-heart`} />
          </button>

          <div className="mt-3 grid grid-cols-3 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <Link to={`/pets/${pet.id}`} className="flex h-12 flex-col items-center justify-center gap-0.5 border-r border-gray-100 bg-white text-orange-500 active:bg-orange-50">
              <i className="fa-regular fa-file-lines text-sm" /><span className="text-[10px] font-bold">ดูข้อมูล</span>
            </Link>
            <button type="button" onClick={() => onEdit?.(pet)} className="flex h-12 flex-col items-center justify-center gap-0.5 border-r border-gray-100 bg-white text-gray-700 active:bg-gray-50">
              <i className="fa-solid fa-pen text-sm" /><span className="text-[10px] font-bold">แก้ไขข้อมูล</span>
            </button>
            <button type="button" onClick={() => onDelete?.(pet)} className="flex h-12 flex-col items-center justify-center gap-0.5 bg-white text-red-500 active:bg-red-50">
              <i className="fa-regular fa-trash-can text-sm" /><span className="text-[10px] font-bold">ลบ</span>
            </button>
          </div>
        </div>
      </article>
    )
  }

  return (
    <div className="relative h-[142px] w-[121px] shrink-0 rounded-[24px] border border-slate-100 bg-white shadow-[0_4px_14px_rgba(15,23,42,0.07)] transition-transform active:scale-[0.98]">
      <Link to={`/pets/${pet.id}`} className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-[24px] px-2 py-3">
        <span className="grid size-14 place-items-center overflow-hidden rounded-full bg-orange-50 text-[23px]">
          {image}
        </span>
        <span className="text-center">
          <strong className="block text-sm font-bold leading-tight text-slate-800">{pet.name}</strong>
          <span className="mt-1 block whitespace-nowrap text-[10px] font-medium leading-tight text-slate-400">{pet.breed || pet.type}</span>
        </span>
      </Link>
      <button type="button" aria-label={pet.favorite ? 'ยกเลิกสัตว์เลี้ยงโปรด' : 'เพิ่มสัตว์เลี้ยงโปรด'} onClick={() => onToggleFavorite?.(pet)} className="absolute right-2 top-1/2 z-10 grid size-8 -translate-y-1/2 place-items-center rounded-full bg-gray-50 text-xs active:scale-90">
        <i className={`${pet.favorite ? 'fa-solid text-orange-500' : 'fa-regular text-gray-300'} fa-heart`} />
      </button>
    </div>
  )
}
