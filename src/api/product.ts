export async function getByProduct(id: number) {
      return { id: 1, name: '无线蓝牙耳机 Pro', no: 'SP20261030001', category: '数码', price: 399.0, originPrice: 499.0, stock: 1286, warnStock: 100, sales: 1286, status: 'on', icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' }
}

export async function getByProducts() {
      return [
            { id: 1, name: '无线蓝牙耳机 Pro', no: 'SP20261030001', category: '数码', price: 399.0, originPrice: 499.0, stock: 1286, warnStock: 100, sales: 1286, status: 'on', icon: 'solar:headphones-round-sound-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
            { id: 2, name: '智能手表 S9', no: 'SP20261030002', category: '数码', price: 899.0, originPrice: 1099.0, stock: 986, warnStock: 100, sales: 986, status: 'on', icon: 'solar:watch-square-bold-duotone', thumb: 'linear-gradient(135deg, #e6f7ee, #cdf0de)' },
            { id: 3, name: '便携充电宝 20000mAh', no: 'SP20261030003', category: '数码', price: 129.0, originPrice: 159.0, stock: 72, warnStock: 100, sales: 872, status: 'on', icon: 'solar:battery-charge-bold-duotone', thumb: 'linear-gradient(135deg, #fff4e6, #ffe4c4)' },
            { id: 4, name: '轻薄羽绒服', no: 'SP20261030004', category: '服饰', price: 599.0, originPrice: 799.0, stock: 756, warnStock: 80, sales: 756, status: 'off', icon: 'solar:bag-smile-bold-duotone', thumb: 'linear-gradient(135deg, #f3e8ff, #e5d4ff)' },
            { id: 5, name: '保湿精华液 50ml', no: 'SP20261030005', category: '美妆', price: 299.0, originPrice: 359.0, stock: 643, warnStock: 60, sales: 643, status: 'on', icon: 'solar:magic-stick-3-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' },
            { id: 6, name: '有机坚果礼盒', no: 'SP20261030006', category: '食品', price: 168.0, originPrice: null, stock: 45, warnStock: 50, sales: 521, status: 'on', icon: 'solar:gift-bold-duotone', thumb: 'linear-gradient(135deg, #fff9e6, #ffefc2)' },
            { id: 7, name: '北欧风陶瓷餐具套装', no: 'SP20261030007', category: '家居', price: 258.0, originPrice: 328.0, stock: 312, warnStock: 50, sales: 398, status: 'off', icon: 'solar:cup-bold-duotone', thumb: 'linear-gradient(135deg, #e8f3ff, #d3e6ff)' },
            { id: 8, name: '婴儿纸尿裤 L 码', no: 'SP20261030008', category: '母婴', price: 139.0, originPrice: 169.0, stock: 86, warnStock: 100, sales: 367, status: 'on', icon: 'solar:hearts-bold-duotone', thumb: 'linear-gradient(135deg, #ffeaea, #ffd6d6)' }
      ]
}

export async function getByCategorys() {
      return [
            { label: '数码', value: 'digital' },
            { label: '服饰', value: 'clothes' },
            { label: '美妆', value: 'beauty' },
            { label: '食品', value: 'food' },
            { label: '家居', value: 'home' },
            { label: '母婴', value: 'baby' }
      ]
}
