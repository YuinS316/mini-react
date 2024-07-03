export const enum FiberFlag {
	NoFlags = 1,
	Placement = 1 << 1,
	Update = 1 << 2,
	ChildDeletion = 1 << 3,

	//	commitRoot时是否执行mutation
	MutationMask = Placement | Update | ChildDeletion
}
