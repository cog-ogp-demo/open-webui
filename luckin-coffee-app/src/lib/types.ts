export interface Shop {
	deptId: number;
	deptName: string;
	address: string;
	deptTags: string[];
	longitude: number;
	latitude: number;
	workTimeStart: string;
	workTimeEnd: string;
	distance: number;
	number: string;
}

export interface ProductAttrValue {
	attributeId: number;
	attributeName: string;
	selected: boolean | null;
	price: number;
	canSelected: number | null;
}

export interface ProductAttr {
	attributeId: number;
	attributeName: string;
	productSubAttrs: ProductAttrValue[];
}

export interface Product {
	productId: number;
	productName: string;
	skuCode: string;
	pictureUrl: string;
	productAttrs: ProductAttr[];
	tags: string[];
	initialPrice: number;
	estimatePrice: number;
}

export interface OrderPreview {
	aboutTime: number;
	discountPrice: number;
	shopInfo: Shop;
	productInfoList: OrderProductInfo[];
	couponCodeList: string[];
	orderGranularCommodityList: OrderCommodity[];
	expressExpectTime: number | null;
	privilegeMoney: number;
	totalInitialPrice: number;
}

export interface OrderProductInfo {
	productId: number;
	skuCode: string;
	name: string;
	amount: number;
	additionDesc: string;
	bigPicUrl: string | null;
	breviaryPicUrl: string | null;
	initPrice: number;
	estimatePrice: number;
	estimateTotalPrice: number;
}

export interface OrderCommodity {
	commodityId: number;
	commodityCode: string;
	commodityName: string;
	payableMoney: number;
	payMoney: number;
}

export interface OrderResult {
	orderId: number;
	payOrderUrl: string;
	payOrderQrCodeUrl: string;
	discountPrice: number;
	needPay: boolean;
	tradeNo: string | null;
	description: string | null;
	orderIdStr: string;
}

export interface OrderDetail {
	orderId: string;
	orderStatus: number;
	orderStatusName: string;
	aboutTime: number;
	takeMealTime: string;
	takeMealCodeInfo: {
		code: string;
		takeOrderId: string;
	};
	shopInfo: Shop;
	productInfoList: OrderProductInfo[] | null;
	orderPayAmount: number;
	dispatchInfo: {
		dispatcherName: string;
		dispatcherMobile: string;
		dispatchAboutTime: string;
		destinationDistance: number;
	};
	orderCommodityList: OrderCommodity[];
	orderType: string;
}

export interface CartItem {
	productId: number;
	productName: string;
	skuCode: string;
	amount: number;
	pictureUrl: string;
	estimatePrice: number;
}
