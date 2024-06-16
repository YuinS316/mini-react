export const enum FiberFlag {
	NoFlags = 1,
	Placement = 1 << 1,
	Update = 1 << 2,
	ChildDeletion = 1 << 3
}
